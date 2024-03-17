import { PrismaClient } from '@prisma/client';
import { addSeconds } from 'date-fns';

const prisma = new PrismaClient();

export function randomShowId() {
  return `test-show-${crypto.randomUUID().slice(-12)}`;
}

export async function seedShow(startDate: Date) {
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
    include: { sets: true },
    data: {
      id: randomShowId(),
      name: 'Test Show',
      description: 'The best radio show on GitHub Actions!',
      startDate,
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

export async function delayShow(showId: string) {
  await prisma.show.update({
    where: { id: showId },
    data: { startDate: addSeconds(new Date(), 10) },
  });
}

function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}
