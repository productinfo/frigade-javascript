import { Flex, Text } from "@frigade/reactv2";

export default {
  title: "Components/Flex",
  component: Flex,
};

export const Default = {
  decorators: [
    () => {
      return (
        <Flex color="blue500" className="testing" style={{ color: "green" }}>
          <Text>Oh ok we're testing some Flex components then!</Text>
        </Flex>
      );
    },
  ],
};
