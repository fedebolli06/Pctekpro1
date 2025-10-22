Param(
    [string]$Source = 'assets/logo-pctekpro.png'
)

Add-Type -AssemblyName System.Drawing

function Save-ResizedPng {
    param(
        [string]$InputPath,
        [string]$OutputPath,
        [int]$Width,
        [int]$Height
    )

    if (-not (Test-Path $InputPath)) {
        Write-Error "Source image not found: $InputPath"
        exit 1
    }

    $img = [System.Drawing.Image]::FromFile($InputPath)
    try {
        $bmp = New-Object System.Drawing.Bitmap($Width, $Height)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        try {
            $g.InterpolationMode  = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $g.SmoothingMode      = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $g.PixelOffsetMode    = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            $g.Clear([System.Drawing.Color]::Transparent)
            $g.DrawImage($img, 0, 0, $Width, $Height)

            $dir = Split-Path -Parent $OutputPath
            if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
            $bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
            Write-Output "Saved $OutputPath ($Width x $Height)"
        } finally {
            $g.Dispose()
            $bmp.Dispose()
        }
    } finally {
        $img.Dispose()
    }
}

Save-ResizedPng -InputPath $Source -OutputPath 'favicon-48x48.png' -Width 48 -Height 48
Save-ResizedPng -InputPath $Source -OutputPath 'apple-touch-icon.png' -Width 180 -Height 180

