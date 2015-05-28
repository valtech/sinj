"..\packages\NuGet.CommandLine.2.8.5\tools\NuGet.exe" pack Sinj.nuspec
"..\packages\NuGet.CommandLine.2.8.5\tools\NuGet.exe" pack Sinj-CommandLine.nuspec
xcopy /y "*.nupkg" "\\paris\nuget\tcuk"
del "*.nupkg"
pause