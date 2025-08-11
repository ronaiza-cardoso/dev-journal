# 📝 Dev Journal

A modern, feature-rich development journal application built with React. Track your daily coding progress, document learnings, and maintain a comprehensive record of your development journey.

![Dev Journal Screenshot](https://via.placeholder.com/800x400/667eea/ffffff?text=Dev+Journal+Interface)

## ✨ Features

- **📅 Daily Entry Tracking** - Document your daily development activities
- **📝 Markdown Support** - Rich text editing with live preview
- **🗂️ Organized Timeline** - View entries organized by year, month, and week
- **💾 Reliable Storage** - IndexedDB for persistent local data storage
- **📤 Export Options** - Export your journal as JSON or Markdown files
- **🔍 Easy Navigation** - Intuitive interface with responsive design
- **✏️ Entry Management** - Edit and delete entries with confirmation modals
- **🎨 Modern UI** - Clean, professional design with smooth animations

## 🚀 Live Demo

**[🔗 View Live Demo](https://dev-journal-coral.vercel.app/)**

Try the application with sample data included!

## 🛠️ Technologies Used

- **React** - Modern UI library
- **IndexedDB** - Client-side database for data persistence
- **Markdown Editor** - Rich text editing with live preview
- **Date-fns** - Date manipulation and formatting
- **Lucide React** - Beautiful icons
- **CSS3** - Modern styling with animations

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/dev-journal.git
   cd dev-journal
   ```

2. **Install dependencies**

   ```bash
   cd journal-ui
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 How to Use

### Creating Your First Entry

1. Click **"Add Entry"** in the navigation
2. Select the date for your entry
3. Write your content using the **Markdown editor**
4. Switch between **MARKDOWN** and **PREVIEW** tabs while writing
5. Click **"Save Entry"** to store your journal entry

### Managing Entries

- **View Entries**: Click "View Entries" to see your timeline
- **Edit Entry**: Click the edit icon on any entry
- **Delete Entry**: Click the delete button and confirm in the modal
- **Export Data**: Use the Export dropdown to download as JSON or Markdown

### Importing Existing Data

- Click **"Import"** to load entries from markdown files
- Supports automatic migration from localStorage to IndexedDB

## 📁 Project Structure

```
dev-journal/
├── journal-ui/
│   ├── public/
│   │   ├── 2024.md          # Sample entries for 2024
│   │   └── 2025.md          # Sample entries for 2025
│   ├── src/
│   │   ├── components/
│   │   │   ├── EntryForm.js          # Entry creation/editing form
│   │   │   ├── EntryList.js          # Timeline view of entries
│   │   │   ├── Header.js             # Navigation header
│   │   │   ├── Modal.js              # Reusable modal component
│   │   │   ├── Notification.js       # Toast notifications
│   │   │   └── DeleteConfirmationModal.js
│   │   ├── services/
│   │   │   └── indexedDBService.js   # Database operations
│   │   ├── App.js            # Main application component
│   │   ├── App.css           # Application styles
│   │   └── markdownParser.js # Markdown file processing
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

No environment variables are required for basic functionality. The app runs entirely client-side.

### Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Modern mobile browsers

## 📊 Data Storage

- **IndexedDB**: Primary storage for journal entries
- **Automatic Migration**: Seamless upgrade from localStorage
- **Export/Import**: JSON and Markdown format support
- **Data Persistence**: Entries survive browser restarts and updates

## 🎨 Customization

The application uses CSS custom properties for easy theming. Key variables:

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #48bb78;
  --error-color: #f56565;
  --warning-color: #ed8936;
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Markdown editor by [@uiw/react-md-editor](https://github.com/uiwjs/react-md-editor)
- Date utilities by [date-fns](https://date-fns.org/)

## 🐛 Bug Reports

If you find a bug, please create an issue with:

- Description of the bug
- Steps to reproduce
- Expected behavior
- Screenshots (if applicable)

## 💡 Feature Requests

Have an idea for a new feature? Open an issue with the "enhancement" label and describe:

- The feature you'd like to see
- Why it would be useful
- Any implementation ideas

---

**Happy journaling! 📚✨**

Made with ❤️ for developers who want to track their growth and document their journey.
