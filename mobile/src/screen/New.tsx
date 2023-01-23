import { useState } from 'react'
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert
} from 'react-native'
import { Feather } from '@expo/vector-icons'

import { BackButton } from '../components/BackButton'
import { Checkbox } from '../components/Checkbox'
import colors from 'tailwindcss/colors'
import { api } from '../lib/axios'

const avaliableWeekDays = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
]

export function New() {
  const [weekDays, setWeekDays] = useState<number[]>([])
  const [title, setTitle] = useState('')
  const [isSubmmiting, setIsSubmmiting] = useState(false)

  const handleToggleWeekDay = (weekDayIndex: number) => {
    if (weekDays.includes(weekDayIndex)) {
      setWeekDays((state) => {
        return state.filter((weekDay) => weekDay !== weekDayIndex)
      })
    } else {
      setWeekDays((state) => {
        return [...state, weekDayIndex]
      })
    }
  }

  const handleCreateNewHabit = async () => {
    try {
      setIsSubmmiting(true)

      if (!title.trim() || weekDays.length === 0) {
        return Alert.alert(
          'Novo Hábito',
          'Informe o nome do hábito e escolha a periodicidade.'
        )
      }

      await api.post('/habits', {
        title,
        weekDays
      })

      Alert.alert('Novo hábito', 'Hábito criado com sucesso!')
    } catch (err) {
      Alert.alert('Ops', `Não foi possivel criar o novo hábito, ${err}.`)
    } finally {
      setTitle('')
      setWeekDays([])
      setIsSubmmiting(false)
    }
  }

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <BackButton />

        <Text className="mt-6 text-white font-extrabold text-3xl">
          Criar hábito
        </Text>

        <Text className="mt-6 text-white font-semibold text-base">
          Qual seu comprometimento
        </Text>

        <TextInput
          placeholder="ex.:Exercícios, dormir bem, etc..."
          placeholderTextColor={colors.zinc[400]}
          className="h-12 pl-4 rounded-lg mt-3 bg-zinc-900 text-white border-2 border-zinc-800  focus:border-green-600"
          value={title}
          onChangeText={(text) => setTitle(text)}
        />

        <Text className="font-semibold mt-4 mb-3 text-white text-base">
          Qual a recorrência?
        </Text>

        {avaliableWeekDays.map((weekDay, index) => (
          <Checkbox
            key={weekDay}
            title={weekDay}
            checked={weekDays.includes(index)}
            onPress={() => handleToggleWeekDay(index)}
          />
        ))}

        <TouchableOpacity
          activeOpacity={0.7}
          className="w-full h-14 flex-row items-center justify-center bg-green-600 rounded-md mt-6"
          onPress={handleCreateNewHabit}
          disabled={isSubmmiting}
        >
          {isSubmmiting ? (
            <Text className="font-semibold text-base text-white ml-2">
              isSubmmiting
            </Text>
          ) : (
            <>
              <Feather name="check" size={20} color={colors.white} />

              <Text className="font-semibold text-base text-white ml-2">
                Confirmar
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}
