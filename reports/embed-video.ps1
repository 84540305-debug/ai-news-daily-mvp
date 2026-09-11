$ErrorActionPreference = 'Stop'

$pptxPath = (Resolve-Path 'reports\AI新闻日报网站设计与部署汇报-基础版-v2.pptx').Path
$videoPath = (Resolve-Path 'media\ai-news-video-30s.mp4').Path
$outputPath = Join-Path (Split-Path $pptxPath) 'AI新闻日报网站设计与部署汇报.pptx'
if (Test-Path -LiteralPath $outputPath) {
  Remove-Item -LiteralPath $outputPath -Force
}

$powerPoint = New-Object -ComObject PowerPoint.Application
$powerPoint.Visible = -1
$presentation = $powerPoint.Presentations.Open($pptxPath, $false, $false, $false)
try {
  $slide = $presentation.Slides.Item(10)
  # Coordinates are points. They match the 800×450 px placeholder on slide 10.
  $null = $slide.Shapes.AddMediaObject2($videoPath, $false, $true, 307.5, 133.5, 600, 337.5)
  $presentation.SaveAs($outputPath, 24)
} finally {
  $presentation.Close()
  $powerPoint.Quit()
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($presentation) | Out-Null
  [System.Runtime.InteropServices.Marshal]::ReleaseComObject($powerPoint) | Out-Null
}

# PowerPoint writes an empty relationship ID on the media click action. It is
# harmless in PowerPoint but fails strict OOXML relationship validation, so the
# empty attribute is removed without altering the embedded media relationship.
Add-Type -AssemblyName System.IO.Compression
$stream = [System.IO.File]::Open($outputPath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::ReadWrite)
$archive = New-Object System.IO.Compression.ZipArchive($stream, [System.IO.Compression.ZipArchiveMode]::Update, $false)
try {
  $entry = $archive.GetEntry('ppt/slides/slide10.xml')
  $reader = New-Object System.IO.StreamReader($entry.Open())
  $xml = $reader.ReadToEnd()
  $reader.Close()
  $entry.Delete()
  $replacement = $archive.CreateEntry('ppt/slides/slide10.xml')
  $writer = New-Object System.IO.StreamWriter($replacement.Open(), [System.Text.UTF8Encoding]::new($false))
  $writer.Write($xml.Replace(' r:id=""', ''))
  $writer.Close()
} finally {
  $archive.Dispose()
  $stream.Dispose()
}

Write-Output $outputPath
