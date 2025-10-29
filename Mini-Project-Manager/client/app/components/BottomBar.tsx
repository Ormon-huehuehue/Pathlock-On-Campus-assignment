import React from 'react'
import { HomeIcon, CalendarIcon, PlusIcon } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import BounceButton from './BounceButton'

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  activeColor: string;
  pillColor: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem = ({ icon, label, activeColor, pillColor, isActive, onClick }: NavItemProps) => (
  <button onClick={onClick} className='relative'>
    <motion.div
      animate={{
        scale: isActive ? 1 : 0.95,
        opacity: isActive ? 1 : 0.5
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 15,
      }}
    >
      <div className={`flex flex-row items-center gap-2 px-6 py-2 rounded-full ${isActive ? pillColor : ''}`}>
        <div className={isActive ? activeColor : 'text-gray-600'}>
          {icon}
        </div>
        <p className={`text-lg font-semibold ${isActive ? activeColor : 'text-gray-600'}`}>
          {label}
        </p>
      </div>
    </motion.div>
  </button>
)

interface NavigationItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  activeColor: string;
  pillColor: string;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: 'Projects',
    icon: <HomeIcon className='w-5 h-5' />,
    href: '/',
    activeColor: 'text-primary-600',
    pillColor: 'bg-primary-100'
  },
  {
    label: 'Smart Scheduler',
    icon: <CalendarIcon className='w-5 h-5' />,
    href: '/scheduler',
    activeColor: 'text-secondary-600',
    pillColor: 'bg-secondary-50'
  },
]

interface BottomBarProps {
  onCreateProject?: () => void;
}

export default function BottomBar({ onCreateProject }: BottomBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const shouldShow = ['/', '/scheduler'].includes(pathname)

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  return (
    <AnimatePresence mode="wait">
      {shouldShow && (
        <motion.div 
          className='fixed bottom-0 left-0 right-0 bottom-[1rem] z-50'
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30
          }}
        >
          <div className='container w-fit mx-auto'>
            <div className='mx-2 mb-4'>
              <div className='bg-white shadow-lg rounded-full p-1 flex items-center justify-between gap-2'>
                {NAVIGATION_ITEMS.map((item) => (
                  <NavItem
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    activeColor={item.activeColor}
                    pillColor={item.pillColor}
                    isActive={pathname === item.href}
                    onClick={() => handleNavigation(item.href)}
                  />
                ))}

                <BounceButton
                  className="bg-[#333333] text-white font-semibold tracking-tight px-6 shadow-lg hover:shadow-xl transition-shadow"
                  startContent={<PlusIcon className="w-5 h-5" />}
                  onPress={onCreateProject || (() => {
                    // Dispatch a custom event that the Dashboard can listen to
                    window.dispatchEvent(new CustomEvent('openProjectModal'));
                  })}
                >
                  Add Project
                </BounceButton>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
