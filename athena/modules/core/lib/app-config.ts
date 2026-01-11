import packageJson from "../../../package.json";

export const useAppConfig = () => {
  return {
    version: packageJson.version,
    appVersion: `WebTools@Athena-v${packageJson.version}`,
    dependencies: Object.keys(packageJson.dependencies),
    devDependencies: Object.keys(packageJson.devDependencies),
  };
};
