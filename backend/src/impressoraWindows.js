const { execFile } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Envia bytes RAW para uma impressora instalada localmente no Windows (por nome),
// via winspool.drv (WritePrinter), usando Add-Type do PowerShell — sem depender
// de nenhum modulo nativo do Node (o pacote 'printer' do npm exige compilacao
// nativa e se mostrou pouco confiavel neste projeto).
const SCRIPT_RAW_PRINT = `
param([string]$NomeImpressora, [string]$ArquivoBytes)

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class NexoGestRawPrinter {
  [StructLayout(LayoutKind.Sequential)]
  public struct DOCINFOA {
    [MarshalAs(UnmanagedType.LPStr)] public string pDocName;
    [MarshalAs(UnmanagedType.LPStr)] public string pOutputFile;
    [MarshalAs(UnmanagedType.LPStr)] public string pDataType;
  }
  [DllImport("winspool.Drv", EntryPoint = "OpenPrinterA", SetLastError = true, CharSet = CharSet.Ansi, ExactSpelling = true)]
  public static extern bool OpenPrinter(string szPrinter, out IntPtr hPrinter, IntPtr pd);
  [DllImport("winspool.Drv", EntryPoint = "ClosePrinter", SetLastError = true, ExactSpelling = true)]
  public static extern bool ClosePrinter(IntPtr hPrinter);
  [DllImport("winspool.Drv", EntryPoint = "StartDocPrinterA", SetLastError = true, CharSet = CharSet.Ansi, ExactSpelling = true)]
  public static extern bool StartDocPrinter(IntPtr hPrinter, int level, ref DOCINFOA di);
  [DllImport("winspool.Drv", EntryPoint = "EndDocPrinter", SetLastError = true, ExactSpelling = true)]
  public static extern bool EndDocPrinter(IntPtr hPrinter);
  [DllImport("winspool.Drv", EntryPoint = "StartPagePrinter", SetLastError = true, ExactSpelling = true)]
  public static extern bool StartPagePrinter(IntPtr hPrinter);
  [DllImport("winspool.Drv", EntryPoint = "EndPagePrinter", SetLastError = true, ExactSpelling = true)]
  public static extern bool EndPagePrinter(IntPtr hPrinter);
  [DllImport("winspool.Drv", EntryPoint = "WritePrinter", SetLastError = true, ExactSpelling = true)]
  public static extern bool WritePrinter(IntPtr hPrinter, IntPtr pBytes, int dwCount, out int dwWritten);

  public static void EnviarBytes(string nomeImpressora, byte[] bytes) {
    IntPtr hPrinter;
    DOCINFOA di = new DOCINFOA();
    di.pDocName = "NexoGest";
    di.pDataType = "RAW";
    if (!OpenPrinter(nomeImpressora, out hPrinter, IntPtr.Zero)) {
      throw new Exception("Nao foi possivel abrir a impressora '" + nomeImpressora + "'. Verifique o nome exato em Impressoras e Scanners.");
    }
    try {
      if (!StartDocPrinter(hPrinter, 1, ref di)) throw new Exception("Falha ao iniciar o documento de impressao.");
      try {
        if (!StartPagePrinter(hPrinter)) throw new Exception("Falha ao iniciar a pagina de impressao.");
        IntPtr pUnmanagedBytes = Marshal.AllocCoTaskMem(bytes.Length);
        try {
          Marshal.Copy(bytes, 0, pUnmanagedBytes, bytes.Length);
          int dwWritten;
          if (!WritePrinter(hPrinter, pUnmanagedBytes, bytes.Length, out dwWritten)) {
            throw new Exception("Falha ao enviar os dados para a impressora.");
          }
        } finally {
          Marshal.FreeCoTaskMem(pUnmanagedBytes);
        }
        EndPagePrinter(hPrinter);
      } finally {
        EndDocPrinter(hPrinter);
      }
    } finally {
      ClosePrinter(hPrinter);
    }
  }

  public static bool TestarConexao(string nomeImpressora) {
    IntPtr hPrinter;
    if (!OpenPrinter(nomeImpressora, out hPrinter, IntPtr.Zero)) {
      return false;
    }
    ClosePrinter(hPrinter);
    return true;
  }
}
"@

try {
  if ($ArquivoBytes) {
    $bytes = [System.IO.File]::ReadAllBytes($ArquivoBytes)
    [NexoGestRawPrinter]::EnviarBytes($NomeImpressora, $bytes)
  } else {
    $ok = [NexoGestRawPrinter]::TestarConexao($NomeImpressora)
    if (-not $ok) { throw ("Impressora nao encontrada: '" + $NomeImpressora + "'. Verifique o nome exato em Impressoras e Scanners.") }
  }
  Write-Output "OK"
} catch {
  Write-Output ("ERRO: " + $_.Exception.Message)
  exit 1
}
`;

function executarScript(nomeImpressora, arquivoBytes) {
  return new Promise((resolve, reject) => {
    // Importante: "powershell -Command <script> -Param valor" NAO faz o bind de
    // -Param ao param() do script (os argumentos extras viram tokens soltos,
    // ignorados). Por isso o script e sempre gravado num .ps1 temporario e
    // executado via -File, que faz o bind correto dos parametros nomeados.
    const scriptTemp = path.join(os.tmpdir(), `nexogest-print-${Date.now()}-${Math.random().toString(36).slice(2)}.ps1`);
    fs.writeFileSync(scriptTemp, SCRIPT_RAW_PRINT);

    const args = ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', scriptTemp, '-NomeImpressora', nomeImpressora];
    if (arquivoBytes) args.push('-ArquivoBytes', arquivoBytes);

    execFile('powershell.exe', args, { timeout: 15000 }, (error, stdout, stderr) => {
      fs.unlink(scriptTemp, () => {});
      const saida = (stdout || '').trim();
      if (error || saida.startsWith('ERRO:')) {
        const mensagem = saida.startsWith('ERRO:') ? saida.slice('ERRO:'.length).trim() : (stderr || error.message || '').trim();
        reject(new Error(mensagem || 'Erro ao comunicar com a impressora Windows.'));
      } else {
        resolve(saida);
      }
    });
  });
}

// Envia o buffer ESC/POS para uma impressora instalada localmente no Windows, por nome exato.
async function enviarBufferParaImpressoraWindows(nomeImpressora, buffer) {
  const arquivoTemp = path.join(os.tmpdir(), `nexogest-cupom-${Date.now()}-${Math.random().toString(36).slice(2)}.prn`);
  fs.writeFileSync(arquivoTemp, buffer);
  try {
    await executarScript(nomeImpressora, arquivoTemp);
  } finally {
    fs.unlink(arquivoTemp, () => {});
  }
}

// So verifica se a impressora existe/responde (OpenPrinter), sem imprimir nada.
async function testarConexaoImpressoraWindows(nomeImpressora) {
  await executarScript(nomeImpressora, null);
}

module.exports = {
  enviarBufferParaImpressoraWindows,
  testarConexaoImpressoraWindows
};
