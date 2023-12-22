import { PrismaClient, type Show } from '@prisma/client';
import { addSeconds } from 'date-fns';

const prisma = new PrismaClient();

export async function seedShow(): Promise<Show> {
  const [showLogoFile, backgroundImageFile] = await Promise.all([
    prisma.file.create({
      data: {
        name: 'test-show-logo.png',
        url: 'https://placehold.co/700x200@2x.png?text=Test+Show',
      },
    }),
    prisma.file.create({
      data: {
        name: 'test-show-background.jpg',
        url: 'https://placehold.co/2400.jpg',
      },
    }),
  ]);

  const show = await prisma.show.create({
    data: {
      id: `test-show-${crypto.randomUUID().slice(-12)}`,
      name: 'Test Show',
      description: 'The best radio show on GitHub Actions!',
      startDate: addSeconds(new Date(), 10),
      backgroundColor: '#000000',
      backgroundColorSecondary: '#000000',

      showLogoFile: { connect: { id: showLogoFile.id } },
      backgroundImageFile: { connect: { id: backgroundImageFile.id } },

      sets: {
        create: {
          artist: 'Test Artist',
          offset: 0,

          audioFileUpload: {
            create: {
              status: '',
              name: '10-sec-silence.mp3',

              audioFile: {
                create: {
                  name: '10-sec-silence.mp3',
                  audioUrl:
                    'https://festivalci.z13.web.core.windows.net/10-sec-silence.mp3',
                  duration: 10,
                },
              },
            },
          },
        },
      },
    },
  });

  return show;
}

export async function deleteShow(showId: string) {
  const show = await prisma.show.findUniqueOrThrow({
    where: { id: showId },
    include: { sets: true },
  });

  await prisma.show.delete({ where: { id: showId } });
  await prisma.file.deleteMany({
    where: { id: { in: [show.showLogoFileId, show.backgroundImageFileId] } },
  });
  await prisma.audioFileUpload.deleteMany({
    where: {
      id: {
        in: show.sets.map((set) => set.audioFileUploadId).filter(isDefined),
      },
    },
  });
}

function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}
