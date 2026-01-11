import { useAppConfig } from "@/modules/core/lib/app-config";

const Page = () => {
  const appConfig = useAppConfig();
  return (
    <div>
      <pre>{JSON.stringify(appConfig, null, 2)}</pre>
    </div>
  );
};

export default Page;
