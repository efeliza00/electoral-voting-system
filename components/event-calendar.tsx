"use client"
import { ElectionDocument } from "@/app/models/Election"
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
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
                start: format(evnt?.startDate, "yyyy-MM-dd hh:mm"),
                end: format(evnt?.endDate, "yyyy-MM-dd hh:mm"),
                description: evnt?.desc,
                title: evnt?.name,
                _options: {
                    disableResize: true,
                },
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
