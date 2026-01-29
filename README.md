# Strava Statistics Dashboard

A modern, feature-rich web application that provides enhanced statistics and visualizations for your Strava activities. Built with React, Vite, and the Strava API.

![Strava Stats Dashboard](https://img.shields.io/badge/Strava-API-orange?style=for-the-badge&logo=strava)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)

## ✨ Features

### 📊 Enhanced Analytics
- **Aggregate Statistics**: Total distance, time, elevation, and activity counts
- **Activity Breakdown**: Detailed stats by activity type (Run, Ride, Swim, etc.)
- **Personal Records**: Track your longest distance, fastest pace, most elevation, and more
- **Best Efforts**: Monitor your best times for 5K, 10K, Half Marathon, and Marathon distances

### 📈 Beautiful Visualizations
- **Trend Charts**: Weekly distance and elevation trends over time
- **Activity Patterns**: Frequency analysis by day of week and time of day
- **Distribution Charts**: Activity type breakdown with pie charts
- **Calendar Heatmap**: GitHub-style activity heatmap showing consistency

### 🎯 Smart Features
- **Date Range Filtering**: Quick presets (Last Week, Month, Year) or custom ranges
- **Activity Type Filters**: Filter by specific activity types
- **Intelligent Caching**: Minimizes API calls to respect rate limits
- **Automatic Token Refresh**: Seamless authentication experience

### 🎨 Premium Design
- Modern dark theme with vibrant gradients
- Glassmorphism effects and smooth animations
- Fully responsive (mobile, tablet, desktop)
- Premium UI that will WOW you at first glance

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- A Strava account
- Strava API credentials (Client ID and Client Secret)

### Step 1: Set Up Strava API

1. **Log in to Strava**: Visit [https://www.strava.com](https://www.strava.com)

2. **Create an API Application**:
   - Go to [https://www.strava.com/settings/api](https://www.strava.com/settings/api)
   - Fill in the application details:
     - **Application Name**: Choose any name (e.g., "My Stats Dashboard")
     - **Category**: Choose the most appropriate category
     - **Club**: Leave blank (optional)
     - **Website**: You can use `http://localhost:5173` for development
     - **Authorization Callback Domain**: **IMPORTANT** - Set to `localhost` (not the full URL, just the domain)
   
3. **Save Your Credentials**:
   - After creating the app, you'll see:
     - **Client ID**: A numerical ID
     - **Client Secret**: A long alphanumeric string (keep this confidential!)
   - You'll need these in the next step

### Step 2: Install and Configure

1. **Clone or navigate to the project directory**:
   ```bash
   cd /home/yashdhanaji/Strava
   ```

2. **Create your environment file**:
   ```bash
   cp .env.example .env
   ```

3. **Edit the `.env` file** and add your Strava credentials:
   ```bash
   nano .env
   # or use your preferred editor
   ```

   Update with your actual values:
   ```env
   VITE_STRAVA_CLIENT_ID=your_actual_client_id
   VITE_STRAVA_CLIENT_SECRET=your_actual_client_secret
   VITE_REDIRECT_URI=http://localhost:5173/callback
   ```

   **⚠️ IMPORTANT**: 
   - Replace `your_actual_client_id` with your actual Client ID (numbers only, no quotes)
   - Replace `your_actual_client_secret` with your actual Client Secret (alphanumeric string, no quotes)
   - Keep `VITE_REDIRECT_URI` exactly as shown above

4. **Save the file** (in nano: `Ctrl+O`, `Enter`, then `Ctrl+X`)

### Step 3: Run the Application

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open your browser**:
   - Navigate to `http://localhost:5173`
   - You should see the login page

3. **Connect with Strava**:
   - Click the "Connect with Strava" button
   - You'll be redirected to Strava to authorize the app
   - After authorization, you'll be redirected back to the dashboard

4. **Enjoy your stats!** 🎉

## 📖 Usage

### Dashboard Overview

Once logged in, you'll see:

1. **Date Range Selector**: Choose a time period to analyze
   - Quick presets: Last Week, Last Month, Last Year
   - Custom range option for specific dates

2. **Activity Type Filters**: Filter by Run, Ride, Swim, or other activity types

3. **Statistics Panels**:
   - **Overview Cards**: Total distance, time, elevation, and activity count
   - **Type Breakdown**: Detailed stats for each activity type

4. **Charts and Visualizations**:
   - **Trend Chart**: Weekly distance and elevation over time
   - **Distribution Chart**: Activity types by distance (pie chart)
   - **Frequency Charts**: Activities by day of week and time of day
   - **Calendar Heatmap**: Visual representation of activity consistency

5. **Personal Records**:
   - Longest distance, duration, fastest pace, most elevation
   - Best running efforts for standard distances

6. **Recent Activities**: List of your most recent activities with key metrics

### Tips for Best Experience

- **Load More Data**: Use longer date ranges to get more comprehensive insights
- **Compare Periods**: Try switching between different time periods to see progress
- **Filter by Type**: Focus on specific activities (like only runs) for targeted analysis
- **Check Consistency**: Use the calendar heatmap to identify training patterns

## 🔧 Troubleshooting

### Common Issues

**Issue**: "Failed to authorize" or redirect errors
- **Solution**: Make sure the "Authorization Callback Domain" in Strava settings is set to `localhost` (not the full URL)
- Verify your `.env` file has the correct Client ID and Client Secret
- Clear your browser cache and try again

**Issue**: No activities showing up
- **Solution**: Make sure you have activities in the selected date range
- Try selecting "Last Year" to see more activities
- Check browser console for errors

**Issue**: Charts not displaying
- **Solution**: Refresh the page
- Make sure you have activities in the selected period

**Issue**: "Rate limit exceeded"
- **Solution**: The app implements caching, but if you hit limits:
  - Wait 15 minutes before making more requests
  - Avoid repeatedly refreshing the page
  - Use longer date ranges to reduce API calls

## 🛠️ Development

### Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── charts/       # Chart components (Recharts)
│   ├── Layout.jsx    # App layout with header/footer
│   ├── ActivityList.jsx
│   ├── StatsPanel.jsx
│   ├── PersonalRecords.jsx
│   └── DateRangeSelector.jsx
├── contexts/         # React contexts
│   └── AuthContext.jsx
├── pages/            # Page components
│   ├── Login.jsx
│   ├── Callback.jsx
│   └── Dashboard.jsx
├── services/         # API integration
│   └── stravaApi.js
├── styles/           # Component-specific styles
├── utils/            # Helper functions
│   ├── dateHelpers.js
│   └── dataProcessing.js
├── App.jsx           # Main app component
├── main.jsx          # Entry point
└── index.css         # Global styles & design system
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Recharts** - Chart library
- **date-fns** - Date utilities

## 🔒 Privacy & Security

- **Read-Only Access**: The app only requests read access to your activities
- **No Data Storage**: Your activities are cached in browser memory only
- **Secure OAuth**: Uses Strava's OAuth 2.0 for authentication
- **Local Storage**: Tokens are stored in browser localStorage (client-side only)
- **No Backend**: This is a pure frontend app - no server stores your data

## 📝 API Rate Limits

Strava API limits:
- 200 requests per 15 minutes
- 2,000 requests per day

The app implements:
- 5-minute in-memory caching
- Efficient pagination
- Batched requests when loading all activities

## 🤝 Contributing

This is a personal project, but feel free to fork and customize it for your own use!

## 📄 License

This project is for personal use. Not affiliated with Strava, Inc.

## 🙏 Acknowledgments

- Built with the [Strava API](https://developers.strava.com/)
- Charts powered by [Recharts](https://recharts.org/)
- Design inspired by modern web applications

## 📞 Support

If you encounter any issues:
1. Check the Troubleshooting section above
2. Verify your Strava API settings
3. Check the browser console for error messages

---

**Built with ❤️ for athletes who love data**
