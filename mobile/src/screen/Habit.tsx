import { useEffect, useState } from 'react'
import { Alert, ScrollView, Text, View } from 'react-native'
import { useRoute } from '@react-navigation/native'
import dayjs from 'dayjs'

import { api } from '../lib/axios'
import { generateProgressPercentage } from '../utils/generate-progress-percentage'

import { BackButton } from '../components/BackButton'
import { ProgressBar } from '../components/ProgressBar'
import { Checkbox } from '../components/Checkbox'
import { Loading } from '../components/Loading'
import { HabitsEmpty } from '../components/HabitsEmpty'
import clsx from 'clsx'

interface HabitProps {
  date: string
}

type PossibleHabitsProps = {
  id: string
  title: string
  createdAt: string
}

interface HabitsInfoProps {
  completedHabits: string[]
  possibleHabits: PossibleHabitsProps[]
}

export function Habit() {
  const routes = useRoute()
  const { date } = routes.params as HabitProps

  const [loading, setLoading] = useState(false)
  const [habitInfo, setHabitInfo] = useState<HabitsInfoProps | null>(null)

  const amountAccomplishedPercentage = habitInfo?.possibleHabits.length
    ? generateProgressPercentage(
        habitInfo?.possibleHabits.length,
        habitInfo.completedHabits.length
      )
    : 0

  const parsedDate = dayjs(date)
  const isDateInPast = parsedDate.endOf('day').isBefore(new Date())
  const dayOfWeek = parsedDate.format('dddd')
  const dayAndMonth = parsedDate.format('DD/MM')

  const getHabits = async () => {
    try {
      setLoading(true)

      const { data } = await api.get('/day', {
        params: { date }
      })

      setHabitInfo(data)
    } catch (error) {
      // aplicar o sentry aqui
      console.log(error)
      Alert.alert(
        'Ops',
        'Não foi possível carregar as informações dos hábitos.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleToggleHabit = async (habitId: string) => {
    const isHabitAlreadyCompleted = habitInfo!.completedHabits.includes(habitId)
    let completedHabits: string[] = []

    try {
      await api.patch(`/habits/${habitId}/toggle`)

      if (isHabitAlreadyCompleted) {
        completedHabits = habitInfo!.completedHabits.filter(
          (id) => id !== habitId
        )
      } else {
        completedHabits = [...habitInfo!.completedHabits, habitId]
      }

      setHabitInfo({
        possibleHabits: habitInfo!.possibleHabits,
        completedHabits
      })
    } catch (err) {
      Alert.alert('Ops', 'Não foi possível atualizar o status do hábito.')
    }
    // onCompletedChanged(completedHabits.length)
  }

  useEffect(() => {
    getHabits()
  }, [])

  if (loading) {
    return <Loading />
  }

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <BackButton />

        <Text className="mt-6 text-zinc-400 font-semibold text-base lowercase">
          {dayOfWeek}
        </Text>

        <Text className="text-white font-extrabold text-3xl">
          {dayAndMonth}
        </Text>

        <ProgressBar progress={amountAccomplishedPercentage} />

        <View
          className={clsx('mt-6', {
            'opacity-50': isDateInPast
          })}
        >
          {habitInfo?.possibleHabits ? (
            habitInfo?.possibleHabits.map((habit) => {
              return (
                <Checkbox
                  key={habit.id}
                  title={habit.title}
                  checked={habitInfo.completedHabits.includes(habit.id)}
                  disabled={isDateInPast}
                  onPress={() => handleToggleHabit(habit.id)}
                />
              )
            })
          ) : (
            <HabitsEmpty />
          )}
        </View>

        {isDateInPast && (
          <Text className="text-white mt-10 text-center">
            Você não pode editar hábitos de uma data passada.
          </Text>
        )}
      </ScrollView>
    </View>
  )
}
