// Importação de módulos
require('dotenv').config();
const shell = require('shelljs');
const prompt = require('prompt-sync')();

// Configuração das variáveis de ambiente
const KEYSTORE_PASSWORD = process.env.KEYSTORE_PASSWORD || prompt('Digite a senha do keystore: ', { echo: '*' });
const KEY_ALIAS = process.env.KEY_ALIAS || 'atendimento';
const KEY_PASSWORD = process.env.KEY_PASSWORD || prompt('Digite a senha do alias: ', { echo: '*' });

// Função principal para geração de build, sincronização, assinatura e otimização de APK
function buildAndSignApks() {
    console.log('Iniciando processo de build e assinatura de APKs...');

    // Limpa builds anteriores
    console.log('Limpando builds anteriores...');
    shell.rm('-rf', 'www');
    shell.rm('-rf', 'android/app/build');
    shell.rm('-rf', `${KEY_ALIAS}-release.apk`);
    shell.rm('-rf', `${KEY_ALIAS}-debug.apk`);

    // Gera o build do Ionic + Angular para produção
    console.log('Gerando build do Ionic + Angular para produção...');
    const ionicBuildResult = shell.exec('npx ionic build --prod', { silent: true });
    if (ionicBuildResult.code !== 0) {
        console.error('Erro ao gerar build do Ionic:', ionicBuildResult.stderr);
        return;
    }
    console.log('Build do Ionic gerado com sucesso.');

    // Sincroniza com Android Capacitor
    console.log('Sincronizando com Android Capacitor...');
    const syncResult = shell.exec('npx cap copy && npx cap sync', { silent: true });
    if (syncResult.code !== 0) {
        console.error('Erro ao sincronizar com Android Capacitor:', syncResult.stderr);
        return;
    }
    console.log('Sincronização com Android Capacitor concluída.');

    // Diretório do Android
    const androidDir = './android';

    // Comandos para compilar APKs de release e debug
    const assembleReleaseCmd = `cd ${androidDir} && ./gradlew assembleRelease`;
    const assembleDebugCmd = `cd ${androidDir} && ./gradlew assembleDebug`;

    // Gerando APK de release
    console.log('Gerando APK de release...');
    const assembleRelease = shell.exec(assembleReleaseCmd, { silent: false });
    if (assembleRelease.code !== 0) {
        console.error('Erro ao gerar APK de release:', assembleRelease.stderr);
        return;
    }
    console.log('APK de release gerado com sucesso.');

    // Gerando APK de debug
    console.log('Gerando APK de debug...');
    const assembleDebug = shell.exec(assembleDebugCmd, { silent: false });
    if (assembleDebug.code !== 0) {
        console.error('Erro ao gerar APK de debug:', assembleDebug.stderr);
        return;
    }
    console.log('APK de debug gerado com sucesso.');

    // Caminhos e nomes dos APKs
    const releaseApkPath = 'android/app/build/outputs/apk/release/app-release-unsigned.apk';
    const debugApkPath = 'android/app/build/outputs/apk/debug/app-debug.apk';

    // Caminho para o keystore
    const keystorePath = `./${KEY_ALIAS}.jks`; // Substitua pelo seu caminho

    // Assinando APK de release com apksigner
    console.log('Assinando APK de release...');
    const signReleaseApkCmd = `apksigner sign --ks ${keystorePath} --ks-key-alias ${KEY_ALIAS} --ks-pass pass:${KEYSTORE_PASSWORD} --key-pass pass:${KEY_PASSWORD} --out ${releaseApkPath.replace('-unsigned', '-signed.apk')} ${releaseApkPath}`;
    const signReleaseApk = shell.exec(signReleaseApkCmd, { silent: true });
    if (signReleaseApk.code !== 0) {
        console.error('Erro ao assinar APK de release:', signReleaseApk.stderr);
        return;
    }
    console.log('APK de release assinado com sucesso.');

    // Otimizando APK de release usando zipalign
    console.log('Otimizando APK de release...');
    const optimizedReleaseApk = `${releaseApkPath.replace('-unsigned', '-aligned.apk')}`;
    const zipalignCmd = `zipalign -v 4 ${releaseApkPath.replace('-unsigned', '-signed.apk')} ${optimizedReleaseApk}`;
    const zipalignResult = shell.exec(zipalignCmd, { silent: true });
    if (zipalignResult.code !== 0) {
        console.error('Erro ao otimizar APK de release:', zipalignResult.stderr);
        return;
    }
    console.log('APK de release otimizado com sucesso.');

    // Movendo APKs para a raiz do projeto
    console.log('Movendo APKs para a raiz do projeto...');
    shell.mv(releaseApkPath.replace('-unsigned', '-signed.apk'), `${KEY_ALIAS}-release.apk`);
    shell.mv(debugApkPath, `${KEY_ALIAS}-debug.apk`);

    console.log('Build concluído com sucesso. APKs disponíveis na raiz do projeto.');
}

// Executando a função principal
buildAndSignApks();
