import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test date calculations
    const testStartDate = '2024-09-01';
    const testDays = 3;
    
    const selectedStartDate = new Date(testStartDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedStartDate.setHours(0, 0, 0, 0);
    
    const daysFromToday = Math.ceil((selectedStartDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    const forecasts = [];
    for (let i = 0; i < testDays; i++) {
      const currentDate = new Date(selectedStartDate);
      currentDate.setDate(selectedStartDate.getDate() + i);
      const dateKey = currentDate.toISOString().split('T')[0];
      
      forecasts.push({
        date: dateKey,
        dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
        originalDate: currentDate.toISOString()
      });
    }
    
    const endDate = new Date(selectedStartDate);
    endDate.setDate(selectedStartDate.getDate() + testDays - 1);
    const endDateString = endDate.toISOString().split('T')[0];
    
    return NextResponse.json({
      success: true,
      test: {
        startDate: testStartDate,
        days: testDays,
        daysFromToday,
        forecasts,
        endDate: endDateString,
        today: today.toISOString().split('T')[0]
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Date calculation test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
