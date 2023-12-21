import { HistoryCard } from "@components/HistoryCard";
import { ScreenHeader } from "@components/ScreenHeader";
import { Heading, SectionList, Text, VStack } from "native-base";
import { useState } from "react";

export function History() {

  const [exercises, setExercises] = useState([
    {
      title: "20.12.23",
      data: ["Puxada frontal", "Puxada baixa"]
    },
    {
      title: "21.12.23",
      data: ["Puxada baixa"]
    }
  ]);

  return (
    <VStack flex={1}>
      <ScreenHeader title="Histórico de exercícios" />

      <SectionList
        sections={exercises}
        keyExtractor={(item) => item}
        renderItem={({ item }) =>
          <HistoryCard />
        }
        renderSectionHeader={({ section }) => (
          <Heading color={'gray.200'} fontSize={'md'} mt={10} mb={3}>
            {section.title}
          </Heading>
        )}
        ListEmptyComponent={() => (
          <Text color={'gray.100'} textAlign={'center'}>
            Não há exercícios registrados ainda. {'\n'}
            Vamos fazer exercícios hoje?
          </Text>
        )}
        contentContainerStyle={exercises.length === 0 && { flex: 1, justifyContent: 'center' }}
        showsVerticalScrollIndicator={false}
        px={8}
      />
    </VStack>
  );
}
