Var SystemDrive

!macro preInit
    ReadEnvStr $SystemDrive SYSTEMDRIVE
    SetRegView 64
    WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$SystemDrive\StopWatch"
    WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$SystemDrive\StopWatch"
    SetRegView 32
    WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$SystemDrive\StopWatch-32bit"
    WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$SystemDrive\StopWatch-32bit"
!macroend
