const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const os = require('os');


const osPlat = os.platform();
const osArch = os.arch();

const platform = getPlatform();
const arch = getArch();
const ext = platform === 'linux' ? 'tgz' : 'zip';

const WSK_VERSION = '1.0.0'
const WSKDEPLOY_VERSION = 'latest'
const WSK_URL = 'https://github.com/apache/openwhisk-cli/releases/download';
const WSKDEPLOY_URL = 'https://github.com/apache/openwhisk-wskdeploy/releases/download';

function getPlatform() {
  switch(osPlat) {
    case 'darwin':
      return 'mac';
    case 'win32':
      return 'windows';
    case 'linux':
      return 'linux';
    default:
      throw new Error(`unsupported platform ${osPlat}`)
  }
}

function getArch() {
  switch(osArch) {
    case 'x32':
      return '386';
    case 'x64':
      return 'amd64';
    case 'arm':
      return 'arm';
    case 'arm64':
      return 'arm64';
    default:
      throw new Error(`unsupported architecture ${osArch}`)
  }
}

async function download(url) {
  const path = tc.downloadTool(url);
  if (platform === 'linux') {
    return tc.extractTar(path)
  } else {
    return tc.extractZip(path)
  }
}

async function downloadWsk() {
  const url = `${WSK_URL}/${WSK_VERSION}/OpenWhisk_CLI-${WSK_VERSION}-${platform}-${arch}.${ext}`;
  return download(url);
}

async function downloadWskDeploy() {
  const url = `${WSKDEPLOY_URL}/${WSKDEPLOY_VERSION}/openwhisk_wskdeploy-${WSK_VERSION}-${platform}-${arch}.${ext}`;
  return download(url);
}

async function run() {
  const owAuth = core.getInput('ow_auth');
  const owHost = core.getInput('ow_host');

  const wskPath = await downloadWsk();
  const wskDeployPath = await downloadWskDeploy();
  
  core.addPath(wskPath);
  core.addPath(wskDeployPath);
  console.log('Installed', wskPath);
  console.log('Installed', wskDeployPath);
}

run().catch(({ message }) => core.setFailed(message));