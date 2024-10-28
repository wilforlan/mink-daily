import { sendToBackground } from "@plasmohq/messaging";
import SettingOption from "../SettingOption"
import { useEffect, useState } from "react";

export default function SettingsTab({ data }: { data: any }) {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState(null);

  const getSettings = async () => {
    try {
      const resp = await sendToBackground({
        name: 'get-account-settings',
      });
      if (!resp.status) throw new Error(resp.error || 'Failed to get settings');
      setSettings(resp?.settings?.options);
    } catch (error) {
      console.error(error);
      setError(error.message || error);
      return null;
    }
  }

  const update = async (key: any, value: any) => {
    try {
      const newSettings = { ...settings, [key]: value };
      const resp = await sendToBackground({
        name: 'update-account-settings',
        body: newSettings
      });
      if (!resp.status) throw new Error(resp.error || 'Failed to update settings');
      console.log('Settings updated successfully');
      setSettings(newSettings);
    } catch (error) {
      console.error(error);
      setError(error.message || error);
    }
  }

  useEffect(() => {
    getSettings();
  }, []);

  return (
    <div className="p-4 mb-4" style={{ minHeight: 500 }}>
      <div className="bg-blue-50 shadow-md p-4 mb-4">
        <p className="text-gray-700 mb-2 text-sm">
          You can customize your account settings here. Change your preferences, notifications, set data retention policies, and more.
        </p>

        {error && <div className="text-red-500 text-sm">{error}</div>}
      </div>
      <fieldset>
        <div className="space-y-5">
          <SettingOption
            title="Start Mink on page after"
            description="Set the time after which Mink should start on every webpage."
            value={settings?.startTrackingSessionAfter || 3}
            onChange={(e: any) => update('startTrackingSessionAfter', e.target.value)}
            type="dropdown"
            options={[{
              label: "3 minutes",
              value: 3
            }, {
              label: "6 minutes",
              value: 6
            }, {
              label: "10 minutes",
              value: 10
            },
            {
              label: "Immediately",
              value: 0
            },
            {
              label: "Never",
              value: 'never'
            }
            ]}
          />

          <SettingOption
            title="Run my Mink summarisation every"
            description="Set the time after which Mink should run on your content."
            value={settings?.executeSummariesAfter || 24}
            onChange={(e: any) => update('executeSummariesAfter', e.target.value)}
            type="dropdown"
            options={[
              {
                label: "3 hours",
                value: 3
              }, {
                label: "6 hours",
                value: 6
              }, {
                label: "12 hours",
                value: 12
              },
              {
                label: "24 hours",
                value: 24
              },
              {
                label: "Never",
                value: 'never'
              }
            ]}
          />

          <SettingOption
            title="Data Retention"
            description="Set data retention policies for your account."
            value={settings?.deleteDataEvery || 3}
            onChange={(e: any) => update('deleteDataEvery', e.target.value)}
            type="dropdown"
            options={[{
              label: "3 Days",
              value: 3
            }, {
              label: "1 Week",
              value: 7
            }, {
              label: "1 Month",
              value: 30
            }
            ]}
          />

          <SettingOption
            title="Limit Minked Webpages"
            description="Limit the number of webpages Mink can run on."
            value={settings?.maxAllowedLinksPerDay || 3}
            onChange={(e: any) => update('maxAllowedLinksPerDay', e.target.value)}
            type="dropdown"
            options={[{
              label: "50 Pages",
              value: 50
            }, {
              label: "100 Pages",
              value: 100
            }, {
              label: "300 Pages",
              value: 300
            },
            {
              label: "Unlimited",
              value: 0
            }
            ]}
          />

          <SettingOption
            title="Notifications"
            description="Receive Mink notifications on your email."
            value={!!settings?.forwardMinkDigestToEmail}
            onChange={(e: any) => update('forwardMinkDigestToEmail', e)}
          />

          <SettingOption
            title="Allow Mink on social media"
            description="Allow Mink to run on social media websites."
            value={settings?.shouldIgnoreSocialMediaPlatforms || false}
            onChange={(e: any) => update('shouldIgnoreSocialMediaPlatforms', e)}
          />
        </div>
      </fieldset>
    </div>
  )
}
