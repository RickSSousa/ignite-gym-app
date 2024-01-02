import { HStack, Heading, Icon, Text, VStack } from "native-base";
import { UserPhoto } from "./UserPhoto";
import { MaterialIcons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

export function HomeHeader() {
  return (
    <HStack bg={'gray.600'} pt={16} pb={5} px={8} alignItems={'center'}>
      <UserPhoto
        source={{ uri: 'https://preview.redd.it/bdmydwuof6u91.jpg?width=640&crop=smart&auto=webp&s=2fed437a6bb7c0fc33d77e51b34b13a51f47c395' }}
        alt="Imagem do usuário"
        size={16}
        mr={4}
      />
      <VStack flex={1}>
        <Text color={'gray.100'} fontSize={'md'}>
          Olá,
        </Text>
        <Heading color={'gray.100'} fontSize={'md'} fontFamily={'heading'}>
          Renato Cariani
        </Heading>
      </VStack>

      <TouchableOpacity>
        <Icon
          as={MaterialIcons}
          name="logout"
          color={'gray.200'}
          size={7}
        />
      </TouchableOpacity>
    </HStack>
  );
}
