interface BaseNode {
  name: string
  type: 'file' | 'folder'
  relative: string
}

export interface FileNode extends BaseNode {
  type: 'file'
}

export interface FolderNode extends BaseNode {
  type: 'folder'
  files: TreeNode[]
}

export type TreeNode = FileNode | FolderNode

export function getAllFolders (files: string[]): string[] {
  /**
   * Returns an array of all nested directories given an array of files and folders.
   *
   * const files = [
   *   'foo.js',
   *   'foo/y/bar.js',
   *   'foo/bar',
   *   'a/b/c',
   * ]
   *
   * getAllFolderNodes(files) //=> ['foo', 'foo/y', 'foo/bar', 'a', 'a/b', 'a/b/c'])
   */
  const dirs = new Set<string>()

  for (const file of files) {
    const path = file.split('/')

    if (path.length) {
      // Does it contain a file? Assumption: files have an extension.
      const hasFileNode = path[path.length - 1].includes('.')

      // Remove file if present.
      const dirOnly = hasFileNode ? path.splice(0, path.length - 1) : path

      // Add directory to set.
      for (let i = 0; i < dirOnly.length; i++) {
        const dir = dirOnly.slice(0, i + 1)

        dirs.add(dir.join('/'))
      }
    }
  }

  return Array.from(dirs)
}

export function getAllFileNodes (files: string[]): Record<string, string[]> {
  /**
   * Returns a key/value map of directories to contained files.
   *
   * {
   *   foo: ['bar.js']
   *   'foo/bar': ['qux.js']
   * }
   */
  const allFileNodes: Record<string, string[]> = {
    '/': [],
  }

  for (const file of files) {
    const split = file.split('/')
    const isFileNode = split[split.length - 1].includes('.')
    const isRoot = split.length === 1
    const isFileNodeInFolderNode = split.length > 1 && split[split.length - 1].includes('.')

    if (isFileNodeInFolderNode) {
      const [file, ...path] = split.reverse()
      const dir = path.reverse().join('/')

      if (!allFileNodes[dir]) {
        allFileNodes[dir] = [file]
      } else {
        allFileNodes[dir] = allFileNodes[dir].concat(file)
      }
    }

    if (isFileNode && isRoot) {
      allFileNodes['/'] = allFileNodes['/'].concat(file)
    }
  }

  return allFileNodes
}

function charCount (str: string, letter: string) {
  let count = 0

  for (let position = 0; position < str.length; position++) {
    if (str.charAt(position) === letter) {
      count += 1
    }
  }

  return count
}

/**
 * Given a list of files and folders, returns an nested array structure
 * representing a file system with use metadata like type, name and relative.
 *
 * const files: string[] = ['x/y/z.js']
 * const actual = makeFileNodeHierarchy(files)
 * [
 *   {
 *     name: 'x',
 *     relative: 'x',
 *     type: 'folder',
 *     files: [
 *       {
 *         name: 'y',
 *         relative: 'x/y',
 *         type: 'folder',
 *         files: [
 *           {
 *             name: 'z.js',
 *             type: 'file',
 *             relative: 'x/y/z.js'
 *           }
 *         ],
 *       }
 *     ]
 *   }
 * ]
 */
export function makeFileHierarchy (files: string[]): TreeNode[] {
  const allFolderNodes = getAllFolders(files)
  const allFileNodes = getAllFileNodes(files)

  const foldersByLength = allFolderNodes.reduce<Record<number, string[]>>((acc, curr) => {
    const count = charCount(curr, '/')

    if (!acc[count]) {
      return { ...acc, [count]: [curr] }
    }

    return { ...acc, [count]: [...acc[count], curr] }
  }, {})

  function walk (dirs: string[], depth = 0): TreeNode[] {
    if (!dirs) {
      return []
    }

    return dirs.map((dir) => {
      const nestedDirs = foldersByLength[depth + 1]
        ? walk(foldersByLength[depth + 1].filter((x) => x.startsWith(dir)), depth + 1)
        : []

      const containedFileNodes = (allFileNodes[dir] || []).map<TreeNode>((file) => {
        return {
          type: 'file',
          name: file,
          relative: `${dir}/${file}`,
        }
      })

      const dirname = dir.split('/').reverse()[0]

      return {
        name: dirname,
        files: [...nestedDirs, ...containedFileNodes],
        type: 'folder',
        relative: dir,
      }
    })
  }

  return walk(foldersByLength[0])
}

interface BuildingFile {
  name: string
  path: string
}

interface BuildingFolder {
  name: string
  path: string
  files: BuildingFile[]
  folders: Record<string, BuildingFolder>
}

export interface TreeFile {
  id: string
  name: string
}

export interface TreeFolder {
  id: string
  name: string
  children: Array<TreeFolder | TreeFile>
}

const convertTree = ({ path, name, files, folders }: BuildingFolder): TreeFolder => {
  return {
    id: path,
    name,
    children: [...Object.values(folders).map(convertTree), ...files.map(({ path, name }) => {
      return {
        id: path,
        name,
      }
    })],
  }
}

export const buildTree = (filePaths: string[], rootDirectory: string) => {
  const rootPathParts = rootDirectory.split('/')

  const lastRootPart = rootPathParts[rootPathParts.length - 1]

  const rootName = lastRootPart
    ? lastRootPart
    : rootPathParts.length > 1
      ? rootPathParts[rootPathParts.length - 2]
      : undefined

  const rootFolder: BuildingFolder = {
    path: rootDirectory,
    name: rootName ?? '/',
    files: [],
    folders: {},
  }

  for (const filePath of filePaths) {
    let parentDirectory = rootFolder

    // All paths should be POSIX compliant
    const pathParts = filePath.split('/')

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i]

      if (i === pathParts.length - 1) {
        // Last item, filename
        parentDirectory.files.push({
          path: filePath,
          name: part,
        })
      } else {
        if (part in parentDirectory.folders) {
          // Directory already exists, switch to new parent
          parentDirectory = parentDirectory.folders[part]
        } else {
          // Directory hasn't been seen before
          const newDirectory: BuildingFolder = {
            path: pathParts.slice(0, i + 1).join('/'),
            name: part,
            files: [],
            folders: {},
          }

          parentDirectory.folders[part] = newDirectory
          parentDirectory = newDirectory
        }
      }
    }
  }

  return convertTree(rootFolder)
}
