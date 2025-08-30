import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test with a sample location (New York City)
    const testData = {
      lat: "40.7128",
      lon: "-74.0060",
      startDate: new Date().toISOString().split('T')[0],
      days: 3 // Free tier supports up to 5 days
    };

    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/weather/forecast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        error: `Weather API test failed: ${response.status}`,
        details: errorText,
        testData
      });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Weather API test successful',
      testData,
      response: data
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Weather API test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      testData: {
        lat: "40.7128",
        lon: "-74.0060",
        startDate: new Date().toISOString().split('T')[0],
        days: 3
      }
    });
  }
}
