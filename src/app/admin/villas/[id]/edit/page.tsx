'use client';

import { useParams } from 'next/navigation';
import VillaForm from '../../../../../components/admin/VillaForm';

export default function EditVillaPage() {
  const params = useParams();
  const villaId = params.id as string;

  return <VillaForm villaId={villaId} isEdit={true} />;
}