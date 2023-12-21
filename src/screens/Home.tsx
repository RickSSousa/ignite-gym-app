import { ExerciseCard } from "@components/ExerciseCard";
import { Group } from "@components/Group";
import { HomeHeader } from "@components/HomeHeader";
import { FlatList, HStack, Heading, Text, VStack } from "native-base";
import { useState } from "react";

export function Home() {

  const [groups, setGroups] = useState(['costas', 'bíceps', 'peito', 'pernas', 'ombros', 'tríceps', 'abdominais', 'antebraços', 'trapézio', 'glúteos', 'panturrilhas', 'cardio']);
  const [exercises, setExercises] = useState(['Remada baixa', 'Puxada alta', 'Puxada frontal', 'Puxada supinada', 'Remada cavalinho', 'Remada curvada', 'Remada unilateral', 'Remada vertical']);
  const [groupSelected, setGroupSelected] = useState('costas');

  return (
    <VStack flex={1}>
      <HomeHeader />

      <FlatList
        data={groups}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Group
            name={item}
            isActive={groupSelected.toLocaleUpperCase() === item.toLocaleUpperCase()}
            onPress={() => setGroupSelected(item)}
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        _contentContainerStyle={{ px: 8 }}
        my={10}
        maxH={10}
      />

      <VStack flex={1} px={8}>
        <HStack justifyContent={'space-between'} mb={5}>
          <Heading color={'gray.200'} fontSize={'md'}>
            Exercícios
          </Heading>
          <Text color={'gray.200'} fontSize={'sm'}>
            {exercises.length}
          </Text>
        </HStack>

        <FlatList
          data={exercises}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <ExerciseCard />
          )}
          _contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </VStack>

    </VStack>
  );
}
