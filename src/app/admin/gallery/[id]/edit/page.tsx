import GalleryForm from '@/components/admin/GalleryForm';

interface EditGalleryPageProps {
  params: { id: string };
}

export default function EditGalleryPage({ params }: EditGalleryPageProps) {
  return <GalleryForm galleryId={params.id} isEdit={true} />;
}