import GalleryForm from '@/components/admin/GalleryForm';

interface EditGalleryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGalleryPage({ params }: EditGalleryPageProps) {
  const { id } = await params;
  return <GalleryForm galleryId={id} isEdit={true} />;
}