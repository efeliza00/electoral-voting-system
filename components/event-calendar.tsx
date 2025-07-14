"use client"
import { ElectionDocument } from "@/app/models/Election"
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
  viewMonthGrid,
} from "@schedule-x/calendar"
import { createEventModalPlugin } from "@schedule-x/event-modal"
import { createEventsServicePlugin } from "@schedule-x/events-service"
import { ScheduleXCalendar, useNextCalendarApp } from "@schedule-x/react"
import "@schedule-x/theme-shadcn/dist/index.css"
import { format } from "date-fns"
import { useState } from "react"

type EventElections = Pick<
    ElectionDocument,
    "_id" | "status" | "name" | "startDate" | "endDate" | "desc"
>

const EventCalendar = ({ events }: { events?: EventElections[] }) => {
    const eventsService = useState(() => createEventsServicePlugin())[0]
    const calendar = useNextCalendarApp({
      defaultView: viewMonthGrid.name,
      calendars: {
        ongoing: {
          colorName: 'ongoing',
          lightColors: {
            main: '#fb923c',
            container: '#ffedd5',
            onContainer: '#7c2d12',
          },

        },
        unavailable: {
          colorName: 'unavailable',
          lightColors: {
            main: '#9ca3af',
            container: '#f3f4f6',
            onContainer: '#18181b',
          },

        },
        completed: {
          colorName: 'completed',
          lightColors: {
            main: '#4ade80',
            container: '#dcfce7',
            onContainer: '#14532d',
          },

        },
      },
        views: [
            createViewDay(),
            createViewWeek(),
            createViewMonthGrid(),
            createViewMonthAgenda(),
        ],
        selectedDate: format(new Date(), "yyyy-MM-dd"),
        events: events?.map((evnt) => {

            return {
                id: evnt?._id.toString(),
              start: format(evnt?.startDate, "yyyy-MM-dd HH:mm"),
              end: format(evnt?.endDate, "yyyy-MM-dd HH:mm"),
                description: evnt?.desc,
                title: evnt?.name,
              calendarId: evnt?.status.toLocaleLowerCase(),

            }
        }),

        theme: "shadcn",
        plugins: [eventsService, createEventModalPlugin()],
        callbacks: {
            onRender: () => {
                eventsService.getAll()
            },
        },
    })
    return <ScheduleXCalendar calendarApp={calendar} />
}

export default EventCalendar
