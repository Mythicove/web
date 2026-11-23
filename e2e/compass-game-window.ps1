param(
  [Parameter(Mandatory)] [int] $RootProcessId,
  [Parameter(Mandatory)] [string] $Screenshot,
  [ValidateSet('capture', 'click', 'continue-first-run')] [string] $Action = 'capture',
  [int] $X = 0,
  [int] $Y = 0
)
$ErrorActionPreference = 'Stop'
if (!(Test-Path -LiteralPath (Split-Path -Parent $Screenshot))) { throw 'Screenshot parent must exist' }
Add-Type -AssemblyName System.Drawing
Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class GameWindow {
  [StructLayout(LayoutKind.Sequential)] public struct Rect { public int Left, Top, Right, Bottom; }
  [StructLayout(LayoutKind.Sequential)] public struct Point { public int X, Y; }
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool GetClientRect(IntPtr h, out Rect rect);
  [DllImport("user32.dll")] public static extern bool ClientToScreen(IntPtr h, ref Point point);
  [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr h, int command);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern void keybd_event(byte key, byte scan, uint flags, UIntPtr extra);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint flags, uint dx, uint dy, uint data, UIntPtr extra);
}
'@
[void] [GameWindow]::SetProcessDPIAware()
# Bind the selected Java window to the application this scenario started.
$processes = @(Get-CimInstance Win32_Process)
$owned = [System.Collections.Generic.HashSet[int]]::new()
[void] $owned.Add($RootProcessId)
do {
  $added = $false
  foreach ($process in $processes) {
    if ($owned.Contains([int] $process.ParentProcessId) -and $owned.Add([int] $process.ProcessId)) { $added = $true }
  }
} while ($added)
$windows = @($processes | Where-Object { $owned.Contains([int] $_.ProcessId) -and $_.Name -in @('java.exe', 'javaw.exe') } | ForEach-Object {
  $p = Get-Process -Id $_.ProcessId
  if ($p.MainWindowHandle -ne 0) { $p }
})
if ($windows.Count -ne 1) { throw "Expected one owned Java window; observed $($windows.Count)" }
$window = $windows[0]
[void] [GameWindow]::ShowWindowAsync($window.MainWindowHandle, 9)
# Explicitly acquire the desktop input foreground before capturing or clicking.
# An Alt key cycle releases Windows' foreground lock without typing into an app.
[GameWindow]::keybd_event(0x12, 0, 0, [UIntPtr]::Zero)
[GameWindow]::keybd_event(0x12, 0, 2, [UIntPtr]::Zero)
[void] [GameWindow]::SetForegroundWindow($window.MainWindowHandle)
Start-Sleep -Milliseconds 300
if ([GameWindow]::GetForegroundWindow() -ne $window.MainWindowHandle) { throw "Owned game window is not foreground (target=$($window.MainWindowHandle), foreground=$([GameWindow]::GetForegroundWindow()))" }
$rect = [GameWindow+Rect]::new()
$origin = [GameWindow+Point]::new()
if (![GameWindow]::GetClientRect($window.MainWindowHandle, [ref] $rect)) { throw 'Cannot read client rectangle' }
if (![GameWindow]::ClientToScreen($window.MainWindowHandle, [ref] $origin)) { throw 'Cannot locate client rectangle' }
$width = $rect.Right - $rect.Left
$height = $rect.Bottom - $rect.Top
if ($Action -eq 'click') {
  if ($X -lt 0 -or $Y -lt 0 -or $X -ge $width -or $Y -ge $height) { throw 'Click must be inside the owned client window' }
  [void] [GameWindow]::SetCursorPos($origin.X + $X, $origin.Y + $Y)
  [GameWindow]::mouse_event(2, 0, 0, 0, [UIntPtr]::Zero)
  [GameWindow]::mouse_event(4, 0, 0, 0, [UIntPtr]::Zero)
  Start-Sleep -Milliseconds 500
}
$bitmap = [System.Drawing.Bitmap]::new($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$continued = $false
try {
  $graphics.CopyFromScreen($origin.X, $origin.Y, 0, 0, [System.Drawing.Size]::new($width, $height))
  $bitmap.Save($Screenshot, [System.Drawing.Imaging.ImageFormat]::Png)
  if ($Action -eq 'continue-first-run' -and $width -eq 854 -and $height -eq 480) {
    # Minecraft 1.21.1's first-run welcome panel and Continue button were reviewed
    # at this default client size. Require its four white panel edges before a
    # scripted click; the loading screen and ordinary menus do not match them.
    $welcome = $true
    foreach ($point in @(@(60,168), @(790,168), @(54,200), @(798,200))) {
      $color = $bitmap.GetPixel($point[0], $point[1])
      if ($color.R -lt 240 -or $color.G -lt 240 -or $color.B -lt 240) { $welcome = $false }
    }
    if ($welcome) {
      [void] [GameWindow]::SetCursorPos($origin.X + 427, $origin.Y + 448)
      [GameWindow]::mouse_event(2, 0, 0, 0, [UIntPtr]::Zero)
      [GameWindow]::mouse_event(4, 0, 0, 0, [UIntPtr]::Zero)
      $continued = $true
    }
  }
} finally { $graphics.Dispose(); $bitmap.Dispose() }
$metadata = @{ rootProcessId = $RootProcessId; processId = $window.Id; title = $window.MainWindowTitle; width = $width; height = $height; screenshot = $Screenshot; action = $Action; x = $X; y = $Y; continued = $continued } | ConvertTo-Json -Compress
[System.IO.File]::WriteAllText([System.IO.Path]::ChangeExtension($Screenshot, '.json'), $metadata)
$metadata
