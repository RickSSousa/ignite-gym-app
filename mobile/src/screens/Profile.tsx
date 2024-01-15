import { Button } from "@components/Button";
import { Input } from "@components/Input";
import { ScreenHeader } from "@components/ScreenHeader";
import { UserPhoto } from "@components/UserPhoto";
import { Center, Heading, ScrollView, Skeleton, Text, VStack, useToast } from "native-base";
import { useState } from "react";
import { TouchableOpacity } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Controller, useForm } from 'react-hook-form';
import { useAuth } from "@hooks/useAuth";
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";

const PHOTO_SIZE = 33;

type FormDataProps = {
  name: string;
  email: string;
  password: string;
  old_password: string;
  confirm_password: string;
};

const profileSchema: any = yup.object({
  name: yup.string().required('Nome obrigatório.'),
  password: yup.string().min(6, 'A senha deve ter no mínimo 6 caracteres.').nullable().transform(value => !!value ? value : null),
  confirm_password: yup.string().nullable().transform(value => value || null)
    .when('password', (password, schema) => {
      return password ? schema.required('Confirmação de senha obrigatória.') : schema;
    })
    .oneOf([yup.ref('password'), null], 'As senhas devem ser iguais.'),

});

export function Profile() {

  const [isUpdating, setIsUpdating] = useState(false);
  const [photoIsLoading, setPhotoIsLoading] = useState(false);
  const [userPhoto, setUserPhoto] = useState('https://preview.redd.it/bdmydwuof6u91.jpg?width=640&crop=smart&auto=webp&s=2fed437a6bb7c0fc33d77e51b34b13a51f47c395');

  const toast = useToast();
  const { user, updateUserProfile } = useAuth();
  const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
    defaultValues: {
      name: user.name,
      email: user.email,
    },
    resolver: yupResolver(profileSchema),
  });

  const handleUserPhotoSelect = async () => {
    setPhotoIsLoading; (true);
    try {
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true,
      });

      if (photoSelected.canceled) {
        return;
      }

      if (photoSelected.assets[0].uri) {
        const photoInfo = await FileSystem.getInfoAsync(photoSelected.assets[0].uri);
        if (photoInfo.exists && (photoInfo.size / 1024 / 1024 > 5)) {
          return toast.show({
            title: 'Imagem muito grande',
            description: 'A imagem selecionada deve ter no máximo 5MB.',
            bgColor: 'red.500',
          });
        }

        setUserPhoto(photoSelected.assets[0].uri);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setPhotoIsLoading(false);
    };
  };

  const handleUpdateProfile = async (formData: FormDataProps) => {
    try {
      setIsUpdating(true);

      const userUpdated = user;
      userUpdated.name = formData.name;

      await api.put('/users', formData);

      await updateUserProfile(userUpdated);

      toast.show({
        title: 'Perfil atualizado com sucesso!',
        placement: 'top',
        bgColor: 'green.500',
      });
    } catch (error) {
      const isAppError = error instanceof AppError;
      const message = isAppError ? error.message : 'Ocorreu um erro ao atualizar o perfil.';

      toast.show({
        title: message,
        placement: 'top',
        bgColor: 'red.500',
      });
    } finally {
      setIsUpdating(false);
    };
  };

  return (
    <VStack flex={1}>
      <ScreenHeader title="Perfil" />
      <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
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
                source={{ uri: userPhoto }}
                alt="Foto do usuário"
                size={PHOTO_SIZE}
              />
          }

          <TouchableOpacity onPress={handleUserPhotoSelect}>
            <Text color={'green.500'} fontWeight={'bold'} fontSize={'md'} mt={2} mb={8}>
              Alterar foto
            </Text>
          </TouchableOpacity>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                bg={'gray.600'}
                placeholder="Nome"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                bg={'gray.600'}
                placeholder="E-mail"
                onChangeText={onChange}
                value={value}
                isDisabled
              />
            )}
          />

          <Heading color={'gray.200'} fontSize={'md'} mb={2} alignSelf={'flex-start'} mt={12} fontFamily={'heading'}>
            Alterar senha
          </Heading>
          <Controller
            control={control}
            name="old_password"
            render={({ field: { onChange } }) => (
              <Input
                bg={'gray.600'}
                placeholder="Senha antiga"
                secureTextEntry
                onChangeText={onChange}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange } }) => (
              <Input
                bg={'gray.600'}
                placeholder="Nova senha"
                secureTextEntry
                onChangeText={onChange}
                errorMessage={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirm_password"
            render={({ field: { onChange } }) => (
              <Input
                bg={'gray.600'}
                placeholder="Confirme nova senha"
                secureTextEntry
                onChangeText={onChange}
                errorMessage={errors.confirm_password?.message}
              />
            )}
          />

          <Button
            title="Atualizar"
            mt={4}
            onPress={handleSubmit(handleUpdateProfile)}
            isLoading={isUpdating}
          />
        </Center>
      </ScrollView>
    </VStack>
  );
}
