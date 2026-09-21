import { notFound } from 'next/navigation';
import { BlueBase } from '@/components/bluebase';
const routes = [
  'login',
  'production',
  'wealth',
  'vendors',
  'events',
  'tools',
  'resources',
  'profile',
  'settings',
];
export default async function Page({ params }: { params: Promise<{ route?: string[] }> }) {
  const { route } = await params;
  if (route && (route.length !== 1 || !routes.includes(route[0]))) notFound();
  return <BlueBase />;
}
