import pagesIcon from "./assets/icons/Home/LeftSidebar/pages.svg";
import layerIcon from "./assets/icons/Home/LeftSidebar/layer.svg";
import assetIcon from "./assets/icons/Home/LeftSidebar/assets.svg";
import audioIcon from "./assets/icons/Home/LeftSidebar/audio.svg";
import objectIcon from "./assets/icons/Home/LeftSidebar/objects.svg";
import moreIcon from "./assets/icons/Home/LeftSidebar/more.svg";

export const getSidebarItems = (activityId) => [
  {
    key: 1,
    icon: pagesIcon,
    path: `/activity/${activityId}/page`,
    label: "Pages",
  },
  {
    key: 2,
    icon: layerIcon,
    path: `/activity/${activityId}/layer`,
    label: "Layers",
  },
  {
    key: 3,
    icon: assetIcon,
    path: `/activity/${activityId}/asset`,
    label: "Assets",
  },
  {
    key: 4,
    icon: audioIcon,
    path: `/activity/${activityId}/audio`,
    label: "Audio",
  },
  {
    key: 5,
    icon: objectIcon,
    path: `/activity/${activityId}/object`,
    label: "Objects",
  },
  {
    key: 6,
    icon: moreIcon,
    path: `/activity/${activityId}/more`,
    label: "More",
  },
];