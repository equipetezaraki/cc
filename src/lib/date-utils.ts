import { addDays, isWeekend, isSameDay } from 'date-fns';

// Brazilian National Holidays (Fixed dates for simplicity, can be expanded)
// Format: MM-DD
const HOLIDAYS = [
    '01-01', // Confraternização Universal
    '04-21', // Tiradentes
    '05-01', // Dia do Trabalho
    '09-07', // Independência do Brasil
    '10-12', // Nossa Senhora Aparecida
    '11-02', // Finados
    '11-15', // Proclamação da República
    '12-25', // Natal
];

// Mobile holidays like Carnaval and Corpus Christi need dynamic calculation or a more robust library/API.
// For MVP, we can add them manually for the current/next year if needed, or stick to fixed ones.
// Adding some common mobile ones for 2024/2025 could be done here if requested.

function isHoliday(date: Date): boolean {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dateString = `${month}-${day}`;
    return HOLIDAYS.includes(dateString);
}

export function calculateBusinessDate(startDate: Date, daysToAdd: number): Date {
    let currentDate = new Date(startDate);
    let addedDays = 0;

    while (addedDays < daysToAdd) {
        currentDate = addDays(currentDate, 1);

        if (!isWeekend(currentDate) && !isHoliday(currentDate)) {
            addedDays++;
        }
    }

    return currentDate;
}

export function addBusinessDays(date: Date, days: number): Date {
    return calculateBusinessDate(date, days);
}
