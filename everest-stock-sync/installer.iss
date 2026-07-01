[Setup]
AppName=Everest Syndication Agent
AppVersion=1.0.0
AppPublisher=Everest Motoring
DefaultDirName={localappdata}\Programs\EverestSyndicationAgent
PrivilegesRequired=lowest
DisableProgramGroupPage=yes
OutputDir=release
OutputBaseFilename=EverestSyndicationAgent-Setup
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
ArchitecturesInstallIn64BitMode=x64compatible

[Files]
Source: "release\app\*"; DestDir: "{app}"; Flags: recursesubdirs createallsubdirs ignoreversion

[Icons]
Name: "{autodesktop}\Everest Syndication Agent"; Filename: "{app}\Start-Agent.bat"; WorkingDir: "{app}"
Name: "{autoprograms}\Everest Syndication Agent"; Filename: "{app}\Start-Agent.bat"; WorkingDir: "{app}"

[Run]
Filename: "{app}\Start-Agent.bat"; Description: "Launch Everest Syndication Agent now"; WorkingDir: "{app}"; Flags: postinstall nowait skipifsilent shellexec
