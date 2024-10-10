const MainRoutes = {
  path: '/main',
  meta: {
    requiresAuth: true
  },
  redirect: '/todos',
  component: () => import('@/layouts/full/FullLayout.vue'),
  children: [
    {
      name: 'Changelogs',
      path: '/changelogs',
      component: () => import('@/views/changelogs/Changelogs.vue')
    },
    {
      name: 'Editor',
      path: '/editor',
      component: () => import('@/views/editor/Editor.vue')
    },
  ]
};

export default MainRoutes;
