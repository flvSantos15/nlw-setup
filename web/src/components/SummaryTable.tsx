import { useEffect, useState } from 'react'
import dayjs from 'dayjs'

import { api } from '../lib/axios'
import { generateDatesFromYearBeginning } from '../utils/generate-dates-from-year-beginning'

import { HabitDay } from './HabitDay'

interface HabitSummaryProps {
  amount: number
  completed: number
  date: string
  id: string
}

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

const summaryDates = generateDatesFromYearBeginning()

const minimunSummaryDatesSize = 18 * 7 // 18 weeks
const amountOfDaysToFill = minimunSummaryDatesSize - summaryDates.length

export function SummaryTable() {
  const [habitSummary, setHabitSummary] = useState<HabitSummaryProps[]>([])

  const getSummaryHabits = async () => {
    const { data } = await api.get('/summary')

    setHabitSummary(data)
  }

  useEffect(() => {
    getSummaryHabits()
  }, [])

  return (
    <div className="w-full flex">
      <div className="grid grid-rows-7 grid-flow-row gap-3">
        {weekDays.map((day, index) => {
          return (
            <div
              key={`${day}-${index}`}
              className="text-zinc-400 text-xl h-10 w-10 font-bold flex items-center justify-center"
            >
              {day}
            </div>
          )
        })}
      </div>

      <div className="grid grid-rows-7 grid-flow-col gap-3">
        {habitSummary.length > 0 &&
          summaryDates.map((date) => {
            const dayInSummary = habitSummary.find((day) => {
              // o isSame checa tudo y-m-d-h-m-s-mm
              // qnd passo o 'day', ele para no day
              return dayjs(date).isSame(day.date, 'day')
            })

            return (
              <HabitDay
                key={date.toString()}
                date={date}
                amount={dayInSummary?.amount}
                defaultCompleted={dayInSummary?.completed}
              />
            )
          })}

        {amountOfDaysToFill > 0 &&
          Array.from({ length: amountOfDaysToFill }).map((_, i) => {
            return (
              <div
                key={i}
                className="w-10 h-10 bg-zinc-900 border-2 border-zinc-800 rounded-lg opacity-40 cursor-not-allowed"
              />
            )
          })}
      </div>
    </div>
  )
}
