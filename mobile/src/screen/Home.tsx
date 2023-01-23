import { useCallback, useState } from 'react'
import { Text, View, ScrollView, Alert } from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'

import { api } from '../lib/axios'
import { generateRangeDatesFromYearStart } from '../utils/generate-range-between-dates'
import dayjs from 'dayjs'

import { Header } from '../components/Header'
import { Loading } from '../components/Loading'
import { HabitDay, DAY_SIZE } from '../components/HabitDay'

interface HabitSummaryProps {
  id: string
  date: string
  amount: number
  completed: number
}

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const datesFromYearStart = generateRangeDatesFromYearStart()
const minimumSummaryDatesSizes = 18 * 5
const amountOfDaysToFill = minimumSummaryDatesSizes - datesFromYearStart.length

export function Home() {
  const { navigate } = useNavigation()

  const [loading, setLoading] = useState(true)
  const [habitSummary, setHabitSummary] = useState<HabitSummaryProps[]>([])

  const getHabitSummary = async () => {
    try {
      setLoading(true)
      const { data } = await api.get('/summary')

      setHabitSummary(data)
    } catch (err) {
      Alert.alert('Ops', 'Não foi possível carregar o sumário de hábitos')
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      getHabitSummary()
    }, [])
  )

  if (loading) {
    return <Loading />
  }

  return (
    <View className="flex-1 bg-background px-8 pt-16">
      <Header />

      <View className="flex-row mt-6 mb-2">
        {weekDays.map((day, index) => (
          <Text
            key={`${day}-${index}`}
            className="text-zinc-400 text-xl font-bold text-center mx-1"
            style={{ width: DAY_SIZE }}
          >
            {day}
          </Text>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {habitSummary && (
          <View className="flex-row flex-wrap">
            {datesFromYearStart.map((date) => {
              const dayWithHabits = habitSummary.find((day) => {
                return dayjs(date).isSame(day.date, 'day')
              })

              return (
                <HabitDay
                  key={date.toString()}
                  date={date}
                  amountOfHabits={dayWithHabits?.amount}
                  amountCompleted={dayWithHabits?.completed}
                  onPress={() =>
                    navigate('habit', {
                      date: date.toISOString()
                    })
                  }
                />
              )
            })}

            {amountOfDaysToFill > 0 &&
              Array.from({ length: amountOfDaysToFill }).map((_, index) => (
                <View
                  key={index}
                  className="bg-zinc-900 rounded-lg border-2 m-1 border-zinc-800 opacity-75"
                  style={{ width: DAY_SIZE, height: DAY_SIZE }}
                />
              ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
