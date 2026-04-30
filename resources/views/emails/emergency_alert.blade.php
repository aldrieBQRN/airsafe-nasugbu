<!DOCTYPE html>
<html>
<head>
    <title>AirSafe Emergency Alert</title>
</head>
<body style="font-family: Arial, sans-serif; color: #1c1917; background-color: #f5f5f4; padding: 20px;">

    <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto; border: 1px solid #e7e5e4;">
        <h2 style="color: #e11d48; margin-top: 0;">⚠️ AirSafe Hazard Alert</h2>

        <p><strong>Location:</strong> {{ $device->barangay->name }}</p>
        <p><strong>Device:</strong> {{ $device->name }} ({{ $device->id }})</p>

        <hr style="border: 0; border-top: 1px solid #e7e5e4; margin: 20px 0;">

        <h3 style="margin-bottom: 10px;">Current Readings:</h3>
        <ul>
            <li><strong>Air Quality Index (AQI):</strong> <span style="color: #e11d48; font-weight: bold;">{{ $reading->aqi }}</span></li>
            <li><strong>Heat Index:</strong> <span style="color: #d97706; font-weight: bold;">{{ $reading->heat_index }}°C</span></li>
            <li><strong>Temperature:</strong> {{ $reading->temperature }}°C</li>
            <li><strong>Humidity:</strong> {{ $reading->humidity }}%</li>
        </ul>

        <hr style="border: 0; border-top: 1px solid #e7e5e4; margin: 20px 0;">

        <p style="font-size: 14px; color: #78716c;">Please access the AirSafe Command Center immediately to review the situation and advise residents.</p>
        <p style="font-size: 12px; color: #a8a29e;">This is an automated message from the AirSafe Nasugbu System.</p>
    </div>

</body>
</html>