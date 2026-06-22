interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: Props) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
}
