import { PrismaClient } from '@prisma/client';
import { addSeconds } from 'date-fns';
import { nanoid } from 'nanoid';

import { isDefined } from '~/utils/is-defined';

const prisma = new PrismaClient();

export function randomShowSlug() {
  return `test-show-${nanoid(12)}`;
}

export async function deleteTestShows() {
  await prisma.show.deleteMany({
    where: {
      slug: { startsWith: 'test-show-' },
    },
  });
}

export async function seedShow(startDate: Date) {
  const [logoImageFile, backgroundImageFile] = await Promise.all([
    prisma.imageFile.create({
      data: {
        name: 'test-show-logo.png',
        url: 'https://placehold.co/700x200@2x.png?text=Test+Show',
      },
    }),
    prisma.imageFile.create({
      data: {
        name: 'test-show-background.jpg',
        url: 'https://placehold.co/2400.jpg',
      },
    }),
  ]);

  const show = await prisma.show.create({
    include: { sets: true },
    data: {
      name: 'Test Show',
      slug: randomShowSlug(),
      description: 'The best radio show on GitHub Actions!',
      startDate,
      timeZone: 'GMT',
      backgroundColor: '#000000',
      backgroundColorSecondary: '#000000',

      logoImageFile: { connect: { id: logoImageFile.id } },
      backgroundImageFile: { connect: { id: backgroundImageFile.id } },

      sets: {
        create: {
          artist: 'Test Artist',
          offset: 0,

          audioFile: {
            create: {
              name: '5-min-silence.mp3',
              url: 'https://festival-ci.fly.storage.tigris.dev/5-min-silence.mp3',
              duration: 5 * 60,
              conversionStatus: 'DONE',
            },
          },
        },
      },
    },
  });

  return show;
}

export async function deleteShow(slug: string) {
  const show = await prisma.show.findUniqueOrThrow({
    where: { slug },
    include: { sets: true },
  });

  await prisma.show.delete({ where: { id: show.id } });
  await prisma.imageFile.deleteMany({
    where: {
      id: {
        in: [show.logoImageFileId, show.backgroundImageFileId].filter(
          isDefined,
        ),
      },
    },
  });
  await prisma.audioFile.deleteMany({
    where: {
      id: {
        in: show.sets.map((set) => set.audioFileId).filter(isDefined),
      },
    },
  });
}

export async function delayShow(slug: string) {
  const show = await prisma.show.findUniqueOrThrow({
    where: { slug },
  });

  await prisma.show.update({
    where: { id: show.id },
    data: { startDate: addSeconds(new Date(), 10) },
  });
}
