adicione o arquivo no mesmo nivel do seu projeto, se possivel adapte o caminho de acordo com a localidade de onde esteja o certificado para assinatura.

O script, faz todas tudo que for nessessario para para gerar o apk e o aab.

Você precisará ter instalado no seu ambiente o gradle, java e o android sdk.

Faça toda a configuração do seu ambiente para que script faça a autonomia de gerar os apks e assina-los.

o processo inclui
  Gerar build em modo produção
  Sicronizar dados de configuração do ionic/capacitor no android
  Build gradle release, debug e pacote simplificado para a play store.
  Assinatura de todos os arquivos gerados, apk e aab

Os arquivos gerados ficarão na pasta raiz do projeto 
{nome-alias}-release.apk
{nome-alias}-debug.apk
{nome-alias}.aab
