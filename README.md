# CardStack - Business Card Management Platform

CardStack is a modern web application that helps professionals digitize, organize, and manage their business cards efficiently using OCR technology and a user-friendly interface.

## 🚀 Features

- **Card Capture**: Take photos of business cards and automatically extract information using OCR
- **Digital Storage**: Securely store and organize all your business cards in one place
- **Smart Search**: Quickly find cards using text search
- **Card Sharing**: Share business cards with team members
- **Mobile Responsive**: Access your cards from any device
- **PWA Support**: Install as a native app on your device
- **Offline Access**: View and manage cards even without internet connection

## 🛠️ Tech Stack

- **Framework**: Next.js 14.1.3
- **Language**: TypeScript
- **Authentication**: NextAuth.js
- **Database**: Prisma with PostgreSQL
- **OCR Engine**: Tesseract.js
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI
- **Icons**: Heroicons

## 📋 Prerequisites

- Node.js 18.x or later
- PostgreSQL database
- npm or yarn package manager

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cards
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="postgresql://..."
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 PWA Installation

CardStack can be installed as a Progressive Web App on your device:

1. Open the website in a supported browser
2. Click the "Add to Home Screen" prompt
3. The app will be installed and available from your device's home screen

## 🔒 Security

- Client-side form validation
- Secure authentication with NextAuth.js
- Protected API routes
- Secure image storage
- CSRF protection

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e
```

## 📦 Project Structure

```
cards/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/             # Utility functions and configurations
│   └── types/           # TypeScript type definitions
├── prisma/              # Database schema and migrations
├── public/             # Static assets
└── tests/              # Test files
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

Built with ❤️ using Next.js and TypeScript
