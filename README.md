# AI Image Generator

A modern web application that generates unique images using artificial intelligence. Built with Next.js 13, TypeScript, and Tailwind CSS.

## Features

- 🎨 AI-powered image generation using Stable Diffusion XL
- 🌓 Dark/Light mode support
- 🔐 Password protection for controlled access
- 📱 Responsive design
- 🖼️ Image gallery with download functionality
- ⚡ Real-time generation status updates
- 💰 Cost-effective image generation 

## Tech Stack

- **Framework:** Next.js 13 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Image Generation:** Stable Diffusion XL
- **Authentication:** Custom middleware with cookie-based auth
- **Icons:** Lucide Icons

## About the AI Model

This project uses Stable Diffusion XL for image generation, chosen for its:
- Excellent value for money (Choose premium models available for higher quality)
- High-quality image output
- Good performance with landscapes and general scenes
- Fast generation speed
- Reliable and consistent results

While it may not excel at extremely detailed features like hands or faces compared to more expensive models, it provides an excellent balance of quality and cost-effectiveness for general purpose image generation.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- An API key for the image generation service

### Installation

1. Clone the repository

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory:
```env
REPLICATE_API_TOKEN=your_replicate_api_key
SITE_PASSWORD=your_chosen_password
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Access the application using the configured password
2. Enter a descriptive prompt in the text field
3. Click "Generate Image" and wait for the AI to create your image
4. View your generated image in the gallery
5. Download or share your images as needed

## Project Structure

```
ai-image-generator/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   └── generate/
│   ├── login/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Gallery.tsx
│   ├── Hero.tsx
│   ├── ImageGenerator.tsx
│   ├── Navbar.tsx
│   └── ThemeProvider.tsx
├── public/
└── middleware.ts
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Stable Diffusion XL](https://stability.ai/stable-diffusion) for the powerful and cost-effective AI image generation model
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Next.js](https://nextjs.org/) team for the amazing framework
