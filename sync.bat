@echo off
echo [SYNC] Iniciando sincronização com GitHub...

:: Adicionar todos os arquivos
git add .

:: Commit com timestamp se não houver mensagem
if "%~1"=="" (
    git commit -m "auto-sync: update project files %date% %time%"
) else (
    git commit -m "%~1"
)

:: Push para branch atual (check for main or master)
git push origin main

echo [SYNC] Sincronização concluída! A Vercel deve iniciar o deploy automaticamente.
echo [SUPABASE] O banco de dados já está operando em tempo real.
pause
