import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { ScreenHeader } from "@components/ScreenHeader";
import { UserPhoto } from "@components/UserPhoto";
import { Center, Heading, ScrollView, Skeleton, Text, VStack } from "native-base";
import { useState } from "react";
import { TouchableOpacity } from "react-native";

const PHOTO_SIZE = 33;

export function Profile() {

  const [photoIsLoading, setPhotoIsLoading] = useState(false);

  return (
    <VStack flex={1}>
      <ScreenHeader title="Perfil" />
      <ScrollView>
        <Center mt={6} px={10}>
          {
            photoIsLoading ?
              <Skeleton
                w={PHOTO_SIZE}
                h={PHOTO_SIZE}
                rounded={'full'}
                startColor={'gray.500'}
                endColor={'gray.400'}
              />
              :
              <UserPhoto
                source={{ uri: 'data:image/jpeg;base64,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' }}
                alt="Foto do usuário"
                size={PHOTO_SIZE}
              />
          }
          <TouchableOpacity>
            <Text color={'green.500'} fontWeight={'bold'} fontSize={'md'} mt={2} mb={8}>
              Alterar foto
            </Text>
          </TouchableOpacity>

          <Input
            bg={'gray.600'}
            placeholder="Nome"
          />
          <Input
            bg={'gray.600'}
            placeholder="E-mail"
            isDisabled
          />
        </Center>

        <VStack px={10} mt={12} mb={9}>
          <Heading color={'gray.200'} fontSize={'md'} mb={2}>
            Alterar senha
          </Heading>
          <Input
            bg={'gray.600'}
            placeholder="Senha antiga"
            secureTextEntry
          />
          <Input
            bg={'gray.600'}
            placeholder="Nova senha"
            secureTextEntry
          />
          <Input
            bg={'gray.600'}
            placeholder="Confirme nova senha"
            secureTextEntry
          />

          <Button
            title="Atualizar"
            mt={4}
          />
        </VStack>
      </ScrollView>
    </VStack>
  );
}
