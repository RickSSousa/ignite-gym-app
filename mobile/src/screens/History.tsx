import { HistoryCard } from "@components/HistoryCard";
import { ScreenHeader } from "@components/ScreenHeader";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";
import { Center, Heading, SectionList, Text, VStack, useToast } from "native-base";
import { useCallback, useState } from "react";
import { useFocusEffect } from '@react-navigation/native';
import { HistoryByDayDTO } from "@dtos/HistoryByDayDTO";
import { Loading } from "@components/Loading";
import { useAuth } from "@hooks/useAuth";

export function History() {

  const [isloading, setIsLoading] = useState(true);
  const [exercises, setExercises] = useState<HistoryByDayDTO[]>([]);

  const toast = useToast();
  const { refreshedToken } = useAuth();

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/history');
      setExercises(response.data);
    } catch (error) {
      const isAppError = error instanceof AppError;
      const title = isAppError ? error.message : 'Erro ao buscar o histórico de exercícios';

      toast.show({
        title,
        placement: 'top',
        bgColor: 'red.500',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(useCallback(() => {
    fetchHistory();
  }, [refreshedToken]));

  return (
    <VStack flex={1}>
      <ScreenHeader title="Histórico de exercícios" />

      {
        isloading ? <Loading /> : (exercises.length ?
          <SectionList
            sections={exercises}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) =>
              <HistoryCard data={item} />
            }
            renderSectionHeader={({ section }) => (
              <Heading color={'gray.200'} fontSize={'md'} mt={10} mb={3} fontFamily={'heading'}>
                {section.title}
              </Heading>
            )}
            contentContainerStyle={exercises.length === 0 && { flex: 1, justifyContent: 'center' }}
            showsVerticalScrollIndicator={false}
            px={8}
          />
          :
          <Center flex={1}>
            <Text color={'gray.100'} textAlign={'center'}>
              Não há exercícios registrados ainda. {'\n'}
              Vamos fazer exercícios hoje?
            </Text>
          </Center>
        )
      }
    </VStack>
  );
}
