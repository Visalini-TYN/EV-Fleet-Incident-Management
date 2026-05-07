import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import heroImg from './assets/hero.png';
import './App.css';
import { Input } from './components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './components/ui/card';
import { Button } from './components/ui/button';

function App() {
  const [count, setCount] = useState(0);
  const [inputValue, setInputValue] = useState('');

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-12'>
      {/* Hero Section */}
      <section
        id='center'
        className='flex flex-col items-center text-center gap-6'
      >
        <div className='hero relative flex justify-center items-center h-48 w-full'>
          <img
            src={heroImg}
            className='base absolute z-0'
            width='170'
            height='179'
            alt=''
          />
          <img
            src={reactLogo}
            className='framework z-10 w-12 h-12'
            alt='React logo'
          />
          <img src={viteLogo} className='vite z-10 w-12 h-12' alt='Vite logo' />
        </div>

        <div className='space-y-2'>
          <h1 className='text-4xl font-bold tracking-tight'>Get started</h1>
          <p className='text-muted-foreground'>
            Edit <code className='bg-muted px-1 rounded'>src/App.tsx</code> and
            save to test <code>HMR</code>
          </p>
        </div>

        <div className='flex flex-col items-center gap-4 w-full max-w-sm'>
          {/* Added Input as requested */}
          <Input
            placeholder='Type something...'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button size='lg' onClick={() => setCount((count) => count + 1)}>
            Count is {count}
          </Button>
        </div>
      </section>

      <div className='ticks border-t'></div>

      {/* Next Steps Grid */}
      <section id='next-steps' className='grid md:grid-cols-2 gap-6'>
        {/* Documentation Card */}
        <Card>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <svg
                className='w-6 h-6 text-primary'
                role='presentation'
                aria-hidden='true'
              >
                <use href='/icons.svg#documentation-icon'></use>
              </svg>
              <CardTitle>Documentation</CardTitle>
            </div>
            <CardDescription>Your questions, answered</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='space-y-2'>
              <li>
                <Button
                  variant='default'
                  className='w-full justify-start'
                  asChild
                >
                  <a href='https://vite.dev/' target='_blank'>
                    <img className='w-4 h-4 mr-2' src={viteLogo} alt='' />{' '}
                    Explore Vite
                  </a>
                </Button>
              </li>
              <li>
                <Button
                  variant='ghost'
                  className='w-full justify-start'
                  asChild
                >
                  <a href='https://react.dev/' target='_blank'>
                    <img className='w-4 h-4 mr-2' src={reactLogo} alt='' />{' '}
                    Learn more
                  </a>
                </Button>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Social Card */}
        <Card>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <svg
                className='w-6 h-6 text-primary'
                role='presentation'
                aria-hidden='true'
              >
                <use href='/icons.svg#social-icon'></use>
              </svg>
              <CardTitle>Connect with us</CardTitle>
            </div>
            <CardDescription>Join the Vite community</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className='grid grid-cols-2 gap-2'>
              {['GitHub', 'Discord', 'X.com', 'Bluesky'].map((platform) => (
                <li key={platform}>
                  <Button
                    variant='outline'
                    className='w-full justify-start px-3'
                    asChild
                  >
                    <a
                      href={`https://${platform.toLowerCase()}.com`}
                      target='_blank'
                    >
                      <svg className='w-4 h-4 mr-2' role='presentation'>
                        <use
                          href={`/icons.svg#${platform.toLowerCase().replace('.', '')}-icon`}
                        ></use>
                      </svg>
                      {platform}
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section id='spacer' className='h-20'></section>
    </div>
  );
}

export default App;
