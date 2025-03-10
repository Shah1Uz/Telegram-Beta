import type { FC } from '../../../lib/teact/teact';
import React, {
  memo, useCallback, useEffect, useState,
} from '../../../lib/teact/teact';
import { getActions, withGlobal } from '../../../global';

import { DEBUG_LOG_FILENAME } from '../../../config';
import { getDebugLogs } from '../../../util/debugConsole';
import download from '../../../util/download';
import { IS_ELECTRON, IS_WAVE_TRANSFORM_SUPPORTED } from '../../../util/windowEnvironment';
import { LOCAL_TGS_URLS } from '../../common/helpers/animatedAssets';

import useHistoryBack from '../../../hooks/useHistoryBack';
import useLastCallback from '../../../hooks/useLastCallback';
import useOldLang from '../../../hooks/useOldLang';

import AnimatedIconWithPreview from '../../common/AnimatedIconWithPreview';
import Checkbox from '../../ui/Checkbox';
import ListItem from '../../ui/ListItem';

type OwnProps = {
  isActive?: boolean;
  onReset: () => void;
};

type StateProps = {
  shouldForceHttpTransport?: boolean;
  shouldAllowHttpTransport?: boolean;
  shouldCollectDebugLogs?: boolean;
  shouldDebugExportedSenders?: boolean;
};

const SettingsExperimental: FC<OwnProps & StateProps> = ({
  isActive,
  onReset,
  shouldForceHttpTransport,
  shouldAllowHttpTransport,
  shouldCollectDebugLogs,
  shouldDebugExportedSenders,
}) => {
  const { requestConfetti, setSettingOption, requestWave } = getActions();
  const lang = useOldLang();

  const [isAutoUpdateEnabled, setIsAutoUpdateEnabled] = useState(false);
  useEffect(() => {
    window.electron?.getIsAutoUpdateEnabled().then(setIsAutoUpdateEnabled);
  }, []);

  useHistoryBack({
    isActive,
    onBack: onReset,
  });

  const handleDownloadLog = useLastCallback(() => {
    const file = new File([getDebugLogs()], DEBUG_LOG_FILENAME, { type: 'text/plain' });
    const url = URL.createObjectURL(file);
    download(url, DEBUG_LOG_FILENAME);
  });

  const handleIsAutoUpdateEnabledChange = useCallback((isChecked: boolean) => {
    window.electron?.setIsAutoUpdateEnabled(isChecked);
  }, []);

  const handleRequestWave = useLastCallback((e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    requestWave({ startX: e.clientX, startY: e.clientY });
  });

  return (
    <div className="settings-content custom-scroll">
      <div className="settings-content-header no-border">
        <AnimatedIconWithPreview
          tgsUrl={LOCAL_TGS_URLS.Experimental}
          size={200}
          className="experimental-duck"
          nonInteractive
          noLoop={false}
        />
        <p className="settings-item-description pt-3" dir="auto">{lang('lng_settings_experimental_about')}</p>
      </div>
      <div className="settings-item">
        <ListItem
          // eslint-disable-next-line react/jsx-no-bind
          onClick={() => requestConfetti({ withStars: true })}
          icon="animations"
        >
          <div className="title">Launch some confetti!</div>
        </ListItem>
        <ListItem
          onClick={handleRequestWave}
          icon="story-expired"
          disabled={!IS_WAVE_TRANSFORM_SUPPORTED}
        >
          <div className="title">Start wave</div>
        </ListItem>

        <Checkbox
          label="Allow HTTP Transport"
          checked={Boolean(shouldAllowHttpTransport)}
          // eslint-disable-next-line react/jsx-no-bind
          onCheck={() => setSettingOption({ shouldAllowHttpTransport: !shouldAllowHttpTransport })}
        />

        <Checkbox
          label="Force HTTP Transport"
          disabled={!shouldAllowHttpTransport}
          checked={Boolean(shouldForceHttpTransport)}
          // eslint-disable-next-line react/jsx-no-bind
          onCheck={() => setSettingOption({ shouldForceHttpTransport: !shouldForceHttpTransport })}
        />

        <Checkbox
          label={lang('DebugMenuEnableLogs')}
          checked={Boolean(shouldCollectDebugLogs)}
          // eslint-disable-next-line react/jsx-no-bind
          onCheck={() => setSettingOption({ shouldCollectDebugLogs: !shouldCollectDebugLogs })}
        />

        <Checkbox
          label="Enable exported senders debug"
          checked={Boolean(shouldDebugExportedSenders)}
          // eslint-disable-next-line react/jsx-no-bind
          onCheck={() => setSettingOption({ shouldDebugExportedSenders: !shouldDebugExportedSenders })}
        />

        {IS_ELECTRON && (
          <Checkbox
            label="Enable autoupdates"
            checked={Boolean(isAutoUpdateEnabled)}
            onCheck={handleIsAutoUpdateEnabledChange}
          />
        )}

        <ListItem
          onClick={handleDownloadLog}
          icon="bug"
        >
          <div className="title">Download log</div>
        </ListItem>
      </div>
    </div>
  );
};

export default memo(withGlobal(
  (global): StateProps => {
    return {
      shouldForceHttpTransport: global.settings.byKey.shouldForceHttpTransport,
      shouldAllowHttpTransport: global.settings.byKey.shouldAllowHttpTransport,
      shouldCollectDebugLogs: global.settings.byKey.shouldCollectDebugLogs,
      shouldDebugExportedSenders: global.settings.byKey.shouldDebugExportedSenders,
    };
  },
)(SettingsExperimental));
