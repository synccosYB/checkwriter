import mailchimp from '@mailchimp/mailchimp_marketing';
import crypto from 'crypto';
import config from 'config';

const { mailchimp: mailchimpConfig } = config;

// Configure Mailchimp
mailchimp.setConfig({
  apiKey: mailchimpConfig.api_key,
  server: mailchimpConfig.server_prefix, // e.g., 'us1', 'us2', etc.
});

// Type definitions
interface ContactResponse {
  success: boolean;
  member?: any;
  message?: string;
  error?: string;
}

interface Contact {
  email: string;
  firstName: string;
  lastName: string;
  tag: string;
}

/**
 * Add a contact to Mailchimp with name and tag
 * @param email - Email address
 * @param firstName - First name
 * @param lastName - Last name
 */
export async function addMailchimpContactWithTag(params: {
  email: string;
  firstName: string;
  lastName: string;
  status?: mailchimp.Status;
  tag?: 'Trial' | 'Subscription' | 'Sign ups';
  subscriptionTag?: 'Active' | 'Canceling' | 'Canceled' | '';
}): Promise<ContactResponse> {
  try {
    const { email, firstName, lastName, status, tag, subscriptionTag } = params;
    // Create MD5 hash of email (required for Mailchimp member ID)
    const subscriberHash = crypto
      .createHash('md5')
      .update(email.toLowerCase())
      .digest('hex');

    console.info(
      `Adding contact: ${email} (${firstName} ${lastName}) with tag: ${mailchimpConfig.tag}`
    );

    const memberData: mailchimp.lists.SetListMemberBody = {
      email_address: email,
      status_if_new: 'subscribed',
      status: status, // Options: 'subscribed', 'unsubscribed', 'cleaned', 'pending'
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName,
      },
    };

    // Add or update the member
    const response = await mailchimp.lists.setListMember(
      mailchimpConfig.list_id,
      subscriberHash,
      memberData
    );

    console.info(`✓ Contact added/updated successfully: ${response.status}`);

    // Step 1: Get existing tags
    const existingTagsRes = (await mailchimp.lists.getListMemberTags(
      mailchimpConfig.list_id,
      subscriberHash
    )) as mailchimp.lists.ListMemberTagsResponse;

    const existingTags = existingTagsRes.tags.map((tag) => ({
      name: tag.name,
      status: 'inactive',
    }));

    const existingTag = existingTags.find((x) => x.name == tag);

    if (existingTag) {
      existingTag.status = 'active';
    } else {
      existingTags.push({ name: tag, status: 'active' });
    }

    if (subscriptionTag) {
      const existingTag = existingTags.find((x) => x.name == subscriptionTag);

      if (existingTag) {
        existingTag.status = 'active';
      } else {
        existingTags.push({ name: subscriptionTag, status: 'active' });
      }
    }
    // Add tag to the member
    await mailchimp.lists.updateListMemberTags(
      mailchimpConfig.list_id,
      subscriberHash,
      {
        tags: existingTags,
      }
    );

    console.info(`✓ Tag "${tag}" assigned successfully`);

    return {
      success: true,
      member: response,
      message: `Contact ${email} added with tag "${tag}"`,
    };
  } catch (error: any) {
    console.error('Error adding contact:', error.message);

    if (error.response) {
      console.error('Mailchimp API Error:', error.response.body);
    }

    return {
      success: false,
      error: error.message,
    };
  }
}
