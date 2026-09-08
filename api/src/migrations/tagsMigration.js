import {
  groupsCollection,
  organizationCollection,
  tagsCollection,
  usersCollection,
} from '../models/dbCollections';

export async function migrateData() {
  console.info('Starting migration...');
  const result = {
    users: [],
    organizations: [],
  };

  try {
    const users = await usersCollection.find({});
    console.info(`Found ${users.length} users to migrate`);

    for (const user of users) {
      const migrated = await migrateEntityData(user, 'user');
      result.users.push({
        _id: user._id,
        migratedGroups: migrated.groups,
        migratedTags: migrated.tags,
      });
    }

    const organizations = await organizationCollection.find({});
    console.info(`Found ${organizations.length} organizations to migrate`);

    for (const org of organizations) {
      const migrated = await migrateEntityData(org, 'organization');
      result.organizations.push({
        _id: org._id,
        migratedGroups: migrated.groups,
        migratedTags: migrated.tags,
      });
    }

    console.info('Migration completed successfully!');
    return result;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

async function migrateEntityData(entity, entityType) {
  const ownerId = entity._id;
  const ownerType = entityType;

  const groupMapping = {};
  const migratedGroups = [];
  const migratedTags = [];

  // Migrate groups
  if (entity.groups && entity.groups.size > 0) {
    console.info(
      `Migrating ${entity.groups.size} groups for ${entityType} ${ownerId}`
    );

    for (const [oldGroupId, groupData] of entity.groups.entries()) {
      const preservedId = String(oldGroupId);

      const existingGroup = await groupsCollection.findById(preservedId);
      if (existingGroup) {
        console.info(`Group ${groupData.name} already exists, skipping`);
        groupMapping[oldGroupId] = preservedId; // Still map the old ID
        continue;
      }

      const savedGroup = await groupsCollection.create({
        _id: preservedId,
        name: groupData.name,
        color: groupData.color,
        ownerId,
        ownerType,
      });
      groupMapping[oldGroupId] = savedGroup._id;

      migratedGroups.push(savedGroup);
      console.info(`Migrated group: ${groupData.name}`);
    }
  }

  // Migrate tags
  if (entity.tags && entity.tags.size > 0) {
    console.info(
      `Migrating ${entity.tags.size} tags for ${entityType} ${ownerId}`
    );

    for (const [oldTagId, tagData] of entity.tags.entries()) {
      const preservedId = String(oldTagId);

      const existingTag = await tagsCollection.findById(preservedId);
      if (existingTag) {
        console.info(`Tag ${tagData.name} already exists, skipping`);
        continue;
      }

      const newTagData = {
        _id: preservedId,
        name: tagData.name,
        color: tagData.color,
        ownerId,
        ownerType,
      };

      if (tagData.group) {
        const oldGroupId = tagData.group.toString();
        if (groupMapping[oldGroupId]) {
          newTagData.group = groupMapping[oldGroupId];
        }
      }

      const savedTag = await tagsCollection.create(newTagData);

      migratedTags.push(savedTag);
      console.info(`Migrated tag: ${tagData.name}`);
    }
  }

  return {
    groups: migratedGroups,
    tags: migratedTags,
  };
}

