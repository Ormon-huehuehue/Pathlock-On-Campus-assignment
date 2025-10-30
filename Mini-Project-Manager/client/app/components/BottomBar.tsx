import React, { memo, useCallback } from 'react'
import { HomeIcon, CalendarIcon, PlusIcon, ListTodo, Brain } from 'lucide-react'
import { motion } from 'framer-motion'
import BounceButton from './BounceButton'
import { usePathname } from 'next/navigation'

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  activeColor: string;
  pillColor: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem = memo(({ icon, label, activeColor, pillColor, isActive, onClick }: NavItemProps) => (
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
      style={{
        willChange: 'transform, opacity'
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
))

interface NavigationItem {
  label: string;
  icon: React.ReactNode;
  tab: TabType;
  activeColor: string;
  pillColor: string;
}

type TabType = 'projects' | 'scheduler' | 'tasks';

// Navigation items for home page
const HOME_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: 'Projects',
    icon: <HomeIcon className='w-5 h-5' />,
    tab: 'projects',
    activeColor: 'text-darkBlue',
    pillColor: 'bg-lightBlue'
  },
]

// Navigation items for project details page
const PROJECT_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: 'Task Details',
    icon: <ListTodo className='w-5 h-5' />,
    tab: 'tasks',
    activeColor: 'text-emerald-700',
    pillColor: 'bg-emerald-100'
  },
  {
    label: 'Smart Scheduler',
    icon: <Brain className='w-5 h-5' />,
    tab: 'scheduler',
    activeColor: 'text-emerald-700',
    pillColor: 'bg-emerald-100'
  },
]

interface BottomBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onCreateProject?: () => void;
}

const BottomBar = memo(({ activeTab, onTabChange, onCreateProject }: BottomBarProps) => {
  const pathname = usePathname();
  const isProjectDetailsPage = pathname?.startsWith('/projects/') && pathname !== '/projects';
  const isHomePage = pathname === '/';
  
  const handleTabChange = useCallback((tab: TabType) => {
    onTabChange(tab);
  }, [onTabChange]);

  // Determine which navigation items to show based on current page
  const navigationItems = isProjectDetailsPage ? PROJECT_NAVIGATION_ITEMS : HOME_NAVIGATION_ITEMS;
  
  // Only show Add Project button on home page
  const showAddProjectButton = isHomePage && onCreateProject;

  return (
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
            {navigationItems.map((item) => (
              <NavItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                activeColor={item.activeColor}
                pillColor={item.pillColor}
                isActive={activeTab === item.tab}
                onClick={() => handleTabChange(item.tab)}
              />
            ))}

            {showAddProjectButton && (
              <BounceButton
                className="bg-[#333333] text-white font-semibold tracking-tight px-6 shadow-lg hover:shadow-xl transition-shadow"
                startContent={<PlusIcon className="w-5 h-5" />}
                onPress={onCreateProject}
              >
                Add Project
              </BounceButton>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
})

BottomBar.displayName = 'BottomBar';

export default BottomBar;
