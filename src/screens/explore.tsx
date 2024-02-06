import { Box } from "grommet";
import { AppLayout } from "../components/app-layout";
import { useLocation } from "react-router-dom";

export const Explore = () => {
  const location = useLocation() as { state?: { url?: string } };

  return (
    <AppLayout activeTab={1} showHeader={false}>
      <Box width="large" alignSelf="center" style={{ minHeight: 200 }} flex>
        <iframe
          src={location.state?.url || "https://www.inspip.com"}
          height="100%"
          width="100%"
          style={{ border: 0 }}
        />
      </Box>
    </AppLayout>
  );
};
